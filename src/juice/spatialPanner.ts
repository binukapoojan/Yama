// src/juice/spatialPanner.ts

export interface SpatialCoords {
  lampX: number;
  lampY: number;
  oppositePan: number;
}

class SpatialPannerController {
  private lampX = 0.5;
  private lampY = 0.42;
  private oppositePan = 0.65;
  private pannerNode: StereoPannerNode | null = null;
  private boundCtx: AudioContext | null = null;

  public setLampPosition(normX: number, normY = 0.42): SpatialCoords {
    this.lampX = Math.max(0, Math.min(1, normX));
    this.lampY = Math.max(0, Math.min(1, normY));

    const delta = 0.5 - this.lampX;
    const sign = delta >= 0 ? 1 : -1;
    const magnitude = Math.min(0.92, Math.max(0.35, Math.abs(delta) * 1.85));
    this.oppositePan = Number((sign * magnitude).toFixed(3));

    if (this.pannerNode && this.boundCtx) {
      try {
        this.pannerNode.pan.setTargetAtTime(this.oppositePan, this.boundCtx.currentTime, 0.08);
      } catch {
        this.pannerNode.pan.value = this.oppositePan;
      }
    }
    return this.getSnapshot();
  }

  public getDestination(ctx: AudioContext, downstream: AudioNode): AudioNode {
    if (typeof ctx.createStereoPanner !== 'function') return downstream;
    if (!this.pannerNode || this.boundCtx !== ctx) {
      this.boundCtx = ctx;
      this.pannerNode = ctx.createStereoPanner();
      this.pannerNode.pan.value = this.oppositePan;
      this.pannerNode.connect(downstream);
    }
    return this.pannerNode;
  }

  public triggerSystolicDuck(
    ctx: AudioContext,
    stems: Array<{ node: GainNode | null; baseGain: number }>,
    intensity = 0.75
  ): void {
    const now = ctx.currentTime;
    const duckRatio = Math.max(0.25, 1 - intensity * 0.6);
    stems.forEach(({ node, baseGain }) => {
      if (!node || baseGain <= 0.001) return;
      try {
        node.gain.cancelScheduledValues(now);
        node.gain.setValueAtTime(baseGain * duckRatio, now);
        node.gain.exponentialRampToValueAtTime(Math.max(0.001, baseGain), now + 0.18);
      } catch {
        // Fallback for test environments
      }
    });
  }

  public getSnapshot(): SpatialCoords {
    return { lampX: this.lampX, lampY: this.lampY, oppositePan: this.oppositePan };
  }
}

export const spatialPanner = new SpatialPannerController();
