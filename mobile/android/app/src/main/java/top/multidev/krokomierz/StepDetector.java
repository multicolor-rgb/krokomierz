package top.multidev.krokomierz;

import android.os.SystemClock;

/** Detektor kroków z akcelerometru — filtr grawitacji + detekcja szczytów. */
public class StepDetector {
    private float gx = 0f;
    private float gy = 0f;
    private float gz = 0f;
    private float lowPass = 0f;
    private float previous = 0f;
    private long lastStep = 0L;

    public boolean push(float x, float y, float z, float sensitivity) {
        gx = gx * 0.9f + x * 0.1f;
        gy = gy * 0.9f + y * 0.1f;
        gz = gz * 0.9f + z * 0.1f;

        float lx = x - gx;
        float ly = y - gy;
        float lz = z - gz;
        float magnitude = (float) Math.sqrt(lx * lx + ly * ly + lz * lz);

        lowPass = lowPass * 0.55f + magnitude * 0.45f;

        long now = SystemClock.elapsedRealtime();
        float threshold = 1.15f / Math.max(0.4f, Math.min(2.5f, sensitivity));
        boolean step = lowPass > threshold && previous <= threshold && now - lastStep > 260;

        if (step) lastStep = now;
        previous = lowPass;
        return step;
    }

    public void reset() {
        gx = gy = gz = lowPass = previous = 0f;
        lastStep = 0L;
    }
}
