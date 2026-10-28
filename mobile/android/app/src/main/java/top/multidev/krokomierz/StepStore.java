package top.multidev.krokomierz;

import android.content.Context;
import android.content.SharedPreferences;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Przechowuje stan licznika kroków w SharedPreferences.
 * Sensor TYPE_STEP_COUNTER zwraca kroki od uruchomienia telefonu,
 * więc przechowujemy wartość bazową i offset (ręczne korekty).
 */
public final class StepStore {
    private static final String PREFS = "krokomierz_steps";
    private static final String KEY_DAY = "day";
    private static final String KEY_BASE = "base";
    private static final String KEY_LAST = "lastRaw";
    private static final String KEY_STEPS = "steps";
    private static final String KEY_OFFSET = "offset";

    private StepStore() {}

    private static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    public static synchronized int update(Context context, int raw) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String day = prefs.getString(KEY_DAY, null);
        int base = prefs.getInt(KEY_BASE, -1);
        int last = prefs.getInt(KEY_LAST, -1);
        int steps = prefs.getInt(KEY_STEPS, 0);
        int offset = prefs.getInt(KEY_OFFSET, 0);

        if (day == null || !day.equals(today())) {
            day = today();
            base = raw;
            steps = 0;
            offset = 0;
        }

        // Restart telefonu lub przepełnienie sensora: zachowujemy dotychczasowe kroki jako offset.
        if (base < 0 || raw < last) {
            base = raw;
            offset = steps;
        }

        int value = Math.max(0, raw - base + offset);
        prefs.edit()
            .putString(KEY_DAY, day)
            .putInt(KEY_BASE, base)
            .putInt(KEY_LAST, raw)
            .putInt(KEY_STEPS, value)
            .putInt(KEY_OFFSET, offset)
            .apply();
        return value;
    }

    public static synchronized int todaySteps(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!today().equals(prefs.getString(KEY_DAY, null))) return 0;
        return prefs.getInt(KEY_STEPS, 0);
    }

    public static synchronized int addOffset(Context context, int amount) {
        if (amount == 0) return todaySteps(context);
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int steps = prefs.getInt(KEY_STEPS, 0) + amount;
        int offset = prefs.getInt(KEY_OFFSET, 0) + amount;
        steps = Math.max(0, steps);
        prefs.edit()
            .putString(KEY_DAY, today())
            .putInt(KEY_STEPS, steps)
            .putInt(KEY_OFFSET, offset)
            .apply();
        return steps;
    }
}
