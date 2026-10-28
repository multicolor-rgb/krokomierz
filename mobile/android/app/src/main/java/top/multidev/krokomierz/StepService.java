package top.multidev.krokomierz;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class StepService extends Service implements SensorEventListener {
    public static volatile boolean RUNNING = false;

    private static final String CHANNEL_ID = "step_service";
    private static final int NOTIFICATION_ID = 1;

    private SensorManager sensorManager;
    private Sensor stepSensor;
    private int lastSteps = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        RUNNING = true;
        createChannel();
        startForeground(NOTIFICATION_ID, buildNotification(0));

        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            if (stepSensor != null) {
                sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_NORMAL);
            }
        }
        lastSteps = StepStore.todaySteps(this);
        updateNotification(lastSteps);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, buildNotification(lastSteps));
        return START_STICKY;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() != Sensor.TYPE_STEP_COUNTER) return;
        int raw = Math.round(event.values[0]);
        int steps = StepStore.update(this, raw);
        if (steps != lastSteps) {
            lastSteps = steps;
            updateNotification(steps);
            StepBus.emit(steps);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // nieużywane
    }

    @Override
    public void onDestroy() {
        RUNNING = false;
        if (sensorManager != null) sensorManager.unregisterListener(this);
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
            channel.setDescription("Stałe powiadomienie aktywnego licznika kroków");
            channel.setShowBadge(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification(int steps) {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Krokomierz liczy kroki")
            .setContentText(steps + " kroków dzisiaj")
            .setSmallIcon(R.drawable.ic_stat_steps)
            .setColor(0xFFC6FF3D)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    private void updateNotification(int steps) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.notify(NOTIFICATION_ID, buildNotification(steps));
    }
}
