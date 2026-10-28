package top.multidev.krokomierz;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.Manifest;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class StepService extends Service implements SensorEventListener {
    public static volatile boolean RUNNING = false;
    public static volatile String ACTIVE_SENSOR = "none";

    private static final String CHANNEL_ID = "step_service";
    private static final int NOTIFICATION_ID = 1;

    private SensorManager sensorManager;
    private Sensor activeSensorObject;
    private final StepDetector stepDetector = new StepDetector();
    private PowerManager.WakeLock wakeLock;
    private int lastSteps = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        RUNNING = true;
        createChannel();
        startForeground(NOTIFICATION_ID, buildNotification(0));
        setupSensor();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getBooleanExtra("reloadSensor", false)) {
            if (sensorManager != null) sensorManager.unregisterListener(this);
            releaseWakeLock();
            stepDetector.reset();
            setupSensor();
        } else if (sensorManager == null) {
            setupSensor();
        }
        startForeground(NOTIFICATION_ID, buildNotification(lastSteps));
        return START_STICKY;
    }

    private void setupSensor() {
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager == null) {
            ACTIVE_SENSOR = "none";
            updateNotification(lastSteps);
            return;
        }

        Sensor counter = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        Sensor detector = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
        Sensor accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        String mode = StepStore.getSensorMode(this);

        boolean activityGranted = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
            || checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
        if (!activityGranted) {
            // Bez uprawnienia sprzętowy counter/detector nie dostarczy danych — używamy akcelerometra.
            counter = null;
            detector = null;
        }

        if ("accelerometer".equals(mode) && accelerometer != null) {
            activeSensorObject = accelerometer;
        } else if ("counter".equals(mode) && counter != null) {
            activeSensorObject = counter;
        } else if ("detector".equals(mode) && detector != null) {
            activeSensorObject = detector;
        } else if (counter != null) {
            activeSensorObject = counter;
        } else if (detector != null) {
            activeSensorObject = detector;
        } else if (accelerometer != null) {
            activeSensorObject = accelerometer;
        }

        if (activeSensorObject == null) {
            ACTIVE_SENSOR = "none";
            updateNotification(lastSteps);
            return;
        }

        int type = activeSensorObject.getType();
        ACTIVE_SENSOR = type == Sensor.TYPE_STEP_COUNTER
            ? "counter"
            : type == Sensor.TYPE_STEP_DETECTOR ? "detector" : "accelerometer";

        int delay = type == Sensor.TYPE_ACCELEROMETER
            ? SensorManager.SENSOR_DELAY_GAME
            : SensorManager.SENSOR_DELAY_NORMAL;
        sensorManager.registerListener(this, activeSensorObject, delay);

        if (type == Sensor.TYPE_ACCELEROMETER) {
            acquireWakeLock();
        }

        lastSteps = StepStore.todaySteps(this);
        updateNotification(lastSteps);
    }

    private void acquireWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) return;
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager == null) return;
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Krokomierz::StepService");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire();
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        wakeLock = null;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (activeSensorObject == null || event.sensor.getType() != activeSensorObject.getType()) return;
        int steps;
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            steps = StepStore.update(this, Math.round(event.values[0]));
        } else if (event.sensor.getType() == Sensor.TYPE_STEP_DETECTOR) {
            StepStore.setLastEvent(this);
            steps = StepStore.addStep(this);
        } else {
            float sensitivity = StepStore.getSensitivity(this);
            if (!stepDetector.push(event.values[0], event.values[1], event.values[2], sensitivity)) return;
            StepStore.setLastEvent(this);
            steps = StepStore.addStep(this);
        }

        if (steps != lastSteps) {
            boolean refresh = lastSteps == 0 || steps - lastSteps >= 5;
            lastSteps = steps;
            if (refresh) updateNotification(steps);
            StepBus.emit(steps);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // nieużywane
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        if (StepStore.isEnabled(this)) {
            scheduleRestart();
        }
        super.onTaskRemoved(rootIntent);
    }

    private void scheduleRestart() {
        try {
            Intent restart = new Intent(this, StepService.class);
            PendingIntent pending = PendingIntent.getService(
                this,
                42,
                restart,
                PendingIntent.FLAG_UPDATE_CURRENT
                    | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );
            AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;
            alarmManager.set(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + 2000,
                pending
            );
        } catch (Exception ignored) {
            // System może zablokować restart — START_STICKY i tak spróbuje wznowić usługę.
        }
    }

    @Override
    public void onDestroy() {
        RUNNING = false;
        ACTIVE_SENSOR = "none";
        releaseWakeLock();
        if (sensorManager != null) sensorManager.unregisterListener(this);
        if (StepStore.isEnabled(this)) scheduleRestart();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Liczenie kroków",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Ciche powiadomienie aktywnego licznika kroków");
            channel.setShowBadge(false);
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PRIVATE);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }

    private String sensorLabel() {
        if ("counter".equals(ACTIVE_SENSOR)) return "sensor systemowy";
        if ("detector".equals(ACTIVE_SENSOR)) return "detektor kroków";
        if ("accelerometer".equals(ACTIVE_SENSOR)) return "akcelerometr";
        return "brak czujnika";
    }

    private Notification buildNotification(int steps) {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT
                | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        String text = ACTIVE_SENSOR.equals("none")
            ? "Brak czujnika ruchu — dodaj kroki ręcznie"
            : steps + " kroków dzisiaj · " + sensorLabel();

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Krokomierz liczy kroki")
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_stat_steps)
            .setColor(0xFFC6FF3D)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .build();
    }

    private void updateNotification(int steps) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.notify(NOTIFICATION_ID, buildNotification(steps));
    }
}
