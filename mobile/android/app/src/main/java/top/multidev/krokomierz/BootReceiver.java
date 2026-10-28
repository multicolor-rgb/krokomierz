package top.multidev.krokomierz;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.content.ContextCompat;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())
            || Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction())) {
            if (!StepStore.isEnabled(context)) return;
            Intent service = new Intent(context, StepService.class);
            try {
                ContextCompat.startForegroundService(context, service);
            } catch (Exception ignored) {
                // System może zablokować start usługi w tle — uruchomi się przy następnym otwarciu aplikacji.
            }
        }
    }
}
