package top.multidev.krokomierz;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

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
        startService();
        JSObject result = new JSObject();
        result.put("running", true);
        call.resolve(result);
    }

    @PermissionCallback
    private void activityPermissionCallback(PluginCall call) {
        if (getPermissionState("activity") == PermissionState.GRANTED) {
            startService();
            JSObject result = new JSObject();
            result.put("running", true);
            call.resolve(result);
        } else {
            call.reject("ACTIVITY_RECOGNITION permission denied");
        }
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

    private void startService() {
        StepStore.setEnabled(getContext(), true);
        Intent intent = new Intent(getContext(), StepService.class);
        ContextCompat.startForegroundService(getContext(), intent);
    }
}
