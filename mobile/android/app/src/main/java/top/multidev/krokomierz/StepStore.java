package top.multidev.krokomierz;

import android.content.Context;
import android.content.SharedPreferences;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Stan licznika kroków. Obsługuje sprzętowy counter (baseline + offset)
 * oraz tryby detector/akcelerometr, w których zliczamy pojedyncze kroki.
 */
public final class StepStore {
    private static final String PREFS = "krokomierz_steps";
    private static final String KEY_DAY = "day";
    private static final String KEY_BASE = "base";
    private static final String KEY_LAST = "lastRaw";
    private static final String KEY_STEPS = "steps";
    private static final String KEY_OFFSET = "offset";
    private static final String KEY_ENABLED = "enabled";
    private static final String KEY_SENSOR_MODE = "sensorMode";
    private static final String KEY_SENSITIVITY = "sensitivity";
    private static final String KEY_LAST_EVENT = "lastEvent";

    private StepStore() {}

    private static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private static void rollover(SharedPreferences prefs) {
        String day = prefs.getString(KEY_DAY, null);
        if (day == null || !day.equals(today())) {
            prefs.edit()
                .putString(KEY_DAY, today())
                .putInt(KEY_BASE, -1)
                .putInt(KEY_LAST, -1)
                .putInt(KEY_STEPS, 0)
                .putInt(KEY_OFFSET, 0)
                .apply();
        }
    }

    /** Sprzętowy TYPE_STEP_COUNTER: wartość od uruchomienia telefonu. */
    public static synchronized int update(Context context, int raw) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        rollover(prefs);

        int base = prefs.getInt(KEY_BASE, -1);
        int last = prefs.getInt(KEY_LAST, -1);
        int steps = prefs.getInt(KEY_STEPS, 0);
        int offset = prefs.getInt(KEY_OFFSET, 0);

        if (base < 0 || raw < last) {
            // Restart telefonu / reset sensora: zachowaj dotychczasowe kroki jako offset.
            base = raw;
            offset = steps;
        }

        int value = Math.max(0, raw - base + offset);
        prefs.edit()
            .putString(KEY_DAY, today())
            .putInt(KEY_BASE, base)
            .putInt(KEY_LAST, raw)
            .putInt(KEY_STEPS, value)
            .putInt(KEY_OFFSET, offset)
            .putLong(KEY_LAST_EVENT, System.currentTimeMillis())
            .apply();
        return value;
    }

    /** Detektor / akcelerometr: pojedynczy krok. */
    public static synchronized int addStep(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        rollover(prefs);
        int steps = prefs.getInt(KEY_STEPS, 0) + 1;
        prefs.edit()
            .putString(KEY_DAY, today())
            .putInt(KEY_STEPS, steps)
            .putLong(KEY_LAST_EVENT, System.currentTimeMillis())
            .apply();
        return steps;
    }

    public static synchronized int todaySteps(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!today().equals(prefs.getString(KEY_DAY, null))) return 0;
        return prefs.getInt(KEY_STEPS, 0);
    }

    public static synchronized int addOffset(Context context, int amount) {
        if (amount == 0) return todaySteps(context);
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        rollover(prefs);
        int steps = Math.max(0, prefs.getInt(KEY_STEPS, 0) + amount);
        int offset = prefs.getInt(KEY_OFFSET, 0) + amount;
        prefs.edit()
            .putString(KEY_DAY, today())
            .putInt(KEY_STEPS, steps)
            .putInt(KEY_OFFSET, offset)
            .putLong(KEY_LAST_EVENT, System.currentTimeMillis())
            .apply();
        return steps;
    }

    public static void setLastEvent(Context context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putLong(KEY_LAST_EVENT, System.currentTimeMillis()).apply();
    }

    public static long getLastEvent(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_LAST_EVENT, 0);
    }

    public static void setEnabled(Context context, boolean enabled) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putBoolean(KEY_ENABLED, enabled).apply();
    }

    public static boolean isEnabled(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getBoolean(KEY_ENABLED, false);
    }

    public static void setSensorMode(Context context, String mode) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putString(KEY_SENSOR_MODE, mode).apply();
    }

    public static String getSensorMode(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_SENSOR_MODE, "auto");
    }

    public static void setSensitivity(Context context, float value) {
        float clamped = Math.max(0.4f, Math.min(2.5f, value));
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putFloat(KEY_SENSITIVITY, clamped).apply();
    }

    public static float getSensitivity(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getFloat(KEY_SENSITIVITY, 1.0f);
    }
}
