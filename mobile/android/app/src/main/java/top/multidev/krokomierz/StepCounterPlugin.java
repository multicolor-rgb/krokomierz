package top.multidev.krokomierz;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "StepCounter",
    permissions = {
        @Permission(alias = "activity", strings = { Manifest.permission.ACTIVITY_RECOGNITION })
    }
)
public class StepCounterPlugin extends Plugin {
    private final StepBus.Listener listener = steps -> {
        JSObject data = new JSObject();
        data.put("steps", steps);
        notifyListeners("step", data);
    };

    @Override
    public void load() {
        StepBus.addListener(listener);
    }

    @Override
    protected void handleOnDestroy() {
        StepBus.removeListener(listener);
        super.handleOnDestroy();
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
            && getPermissionState("activity") != PermissionState.GRANTED) {
            requestPermissionForAlias("activity", call, "activityPermissionCallback");
            return;
        }
        startService(call, true);
    }

    @PermissionCallback
    private void activityPermissionCallback(PluginCall call) {
        boolean granted = getPermissionState("activity") == PermissionState.GRANTED;
        // Akcelerometr nie wymaga ACTIVITY_RECOGNITION, więc startujemy także po odmowie.
        startService(call, granted);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        StepStore.setEnabled(getContext(), false);
        Intent intent = new Intent(getContext(), StepService.class);
        getContext().stopService(intent);
        StepService.RUNNING = false;
        call.resolve();
    }

    @PluginMethod
    public void getToday(PluginCall call) {
        JSObject result = new JSObject();
        result.put("steps", StepStore.todaySteps(getContext()));
        result.put("running", StepService.RUNNING);
        result.put("sensor", StepService.ACTIVE_SENSOR);
        call.resolve(result);
    }

    @PluginMethod
    public void addSteps(PluginCall call) {
        int amount = call.getInt("steps", 0);
        int steps = StepStore.addOffset(getContext(), amount);
        JSObject result = new JSObject();
        result.put("steps", steps);
        call.resolve(result);
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        JSObject result = new JSObject();
        boolean granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
            || getPermissionState("activity") == PermissionState.GRANTED;
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
            || getPermissionState("activity") == PermissionState.GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAlias("activity", call, "requestPermissionCallback");
    }

    @PermissionCallback
    private void requestPermissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", getPermissionState("activity") == PermissionState.GRANTED);
        call.resolve(result);
    }

    @PluginMethod
    public void getDiagnostics(PluginCall call) {
        Context context = getContext();
        SensorManager sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        boolean ignoringBattery = Build.VERSION.SDK_INT < Build.VERSION_CODES.M
            || (powerManager != null && powerManager.isIgnoringBatteryOptimizations(context.getPackageName()));

        JSObject result = new JSObject();
        result.put("hasCounter", sensorManager != null && sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null);
        result.put("hasDetector", sensorManager != null && sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR) != null);
        result.put("hasAccelerometer", sensorManager != null && sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null);
        result.put("sensorMode", StepStore.getSensorMode(context));
        result.put("activeSensor", StepService.ACTIVE_SENSOR);
        result.put("serviceRunning", StepService.RUNNING);
        result.put("activityPermission", Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
            || getPermissionState("activity") == PermissionState.GRANTED);
        result.put("notificationPermission", NotificationManagerCompat.from(context).areNotificationsEnabled());
        result.put("batteryOptimized", !ignoringBattery);
        result.put("todaySteps", StepStore.todaySteps(context));
        result.put("lastEventAt", StepStore.getLastEvent(context));
        result.put("sensitivity", StepStore.getSensitivity(context));
        result.put("manufacturer", Build.MANUFACTURER);
        result.put("model", Build.MODEL);
        result.put("sdk", Build.VERSION.SDK_INT);
        call.resolve(result);
    }

    @PluginMethod
    public void setSensorMode(PluginCall call) {
        String mode = call.getString("mode", "auto");
        if (!mode.equals("auto") && !mode.equals("counter") && !mode.equals("detector") && !mode.equals("accelerometer")) {
            mode = "auto";
        }
        StepStore.setSensorMode(getContext(), mode);
        if (StepService.RUNNING) {
            Intent intent = new Intent(getContext(), StepService.class);
            intent.putExtra("reloadSensor", true);
            ContextCompat.startForegroundService(getContext(), intent);
        }
        JSObject result = new JSObject();
        result.put("mode", mode);
        call.resolve(result);
    }

    @PluginMethod
    public void setSensitivity(PluginCall call) {
        float value = call.getFloat("value", 1.0f);
        StepStore.setSensitivity(getContext(), value);
        call.resolve();
    }

    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        Context context = getContext();
        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        boolean ignoring = Build.VERSION.SDK_INT < Build.VERSION_CODES.M
            || (powerManager != null && powerManager.isIgnoringBatteryOptimizations(context.getPackageName()));
        JSObject result = new JSObject();
        result.put("ignoring", ignoring);
        call.resolve(result);
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(
            Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
            Uri.parse("package:" + context.getPackageName())
        );
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            context.startActivity(intent);
        } catch (Exception first) {
            try {
                context.startActivity(
                    new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                );
            } catch (Exception ignored) {
                // brak ustawień na tym ROM-ie
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void openAutostartSettings(PluginCall call) {
        Context context = getContext();
        Intent miui = new Intent();
        miui.setComponent(new ComponentName(
            "com.miui.securitycenter",
            "com.miui.permcenter.autostart.AutoStartManagementActivity"
        ));
        miui.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            context.startActivity(miui);
        } catch (Exception first) {
            try {
                context.startActivity(
                    new Intent(
                        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                        Uri.parse("package:" + context.getPackageName())
                    ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                );
            } catch (Exception ignored) {
                // brak ustawień
            }
        }
        call.resolve();
    }

    private void startService(PluginCall call, boolean activityGranted) {
        StepStore.setEnabled(getContext(), true);
        ContextCompat.startForegroundService(getContext(), new Intent(getContext(), StepService.class));
        JSObject result = new JSObject();
        result.put("running", true);
        result.put("activityPermission", activityGranted);
        result.put("sensor", StepService.ACTIVE_SENSOR);
        call.resolve(result);
    }
}
