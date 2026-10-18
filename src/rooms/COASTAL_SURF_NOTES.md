# Coastal event continuity

The ocean uses a continuous base water surface and three reusable folded surf
meshes. A mesh slot is not a physical wave identity: `waveId` identifies each new
event, and its height and runup reach are sampled once from that event's seeded
field. An island-centre ray supplies a stable alongshore coordinate shared by the
folded face, underlying bore, whitewater and moving wet/dry edge.

An event travels shoreward, loses its folded face while handing over to a low
moving bore, reaches the beach, then carries its shoreline through a parabolic
uprush and rundown. The connected water edge is the most landward active front.
The face may retire below the base water; its event's bore and foam remain until
the rundown has returned near the initial shoreline. A retreating shoreline
cannot restore an event's retired face.

This is an authored real-time approximation, not a shallow-water or volume
conserving fluid solver. Runup distance, duration and large rooftop-visible wave
heights are art-directed. The causal ordering and the parabolic shoreline path
are informed by these primary coastal dynamics sources:

- M. C. Shen and R. E. Meyer (1963), *Climb of a bore on a beach, Part 3. Run-up*,
  Journal of Fluid Mechanics 16, 113–125. Describes a shoreward bore decreasing in
  height before collapse, followed by a thin runup and backwash sheet.
  https://doi.org/10.1017/S0022112063000628
- Nimish Pujara, Philip L.-F. Liu and Harry Yeh (2015), *The swash of solitary
  waves on a plane beach: flow evolution, bed shear stress and run-up*, Journal
  of Fluid Mechanics 779, 556–597. Large-scale measurements and theoretical
  review describe a gravity-dominated, parabolic shoreline trajectory following
  waveform collapse. https://doi.org/10.1017/jfm.2015.435
- Hilary F. Stockdon and Rob A. Holman (2011), USGS Data Series 602,
  *Observations of Wave Runup, Setup, and Swash on Natural Beaches*. Observations
  from ten field experiments support treating individual swash excursion and
  runup as consequences of incoming wave events, with variable reach.
  https://pubs.usgs.gov/ds/602/

No source code, imagery, measurements or recorded footage from these works is
included in the runtime.
