package top.multidev.krokomierz;

import java.util.concurrent.CopyOnWriteArrayList;

/** Prosty most między usługą liczącą kroki a pluginem Capacitora (ten sam proces). */
public final class StepBus {
    public interface Listener {
        void onStep(int steps);
    }

    private static final CopyOnWriteArrayList<Listener> LISTENERS = new CopyOnWriteArrayList<>();

    private StepBus() {}

    public static void addListener(Listener listener) {
        if (!LISTENERS.contains(listener)) LISTENERS.add(listener);
    }

    public static void removeListener(Listener listener) {
        LISTENERS.remove(listener);
    }

    public static void emit(int steps) {
        for (Listener listener : LISTENERS) {
            try {
                listener.onStep(steps);
            } catch (Exception ignored) {
            }
        }
    }
}
