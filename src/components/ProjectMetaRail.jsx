/**
 * Project meta rail: one small, quiet, editorial line that belongs to a PROJECT (not to the application). It is rendered inside the
 * project panel's own content grid, well below the global header, and only carries data of that project. No counts, no controls.
 */
export default function ProjectMetaRail({ label, context, discipline }) {
  return <div className="wk-meta-rail">
    <span className="wk-meta-rail__label">{label}</span>
    <i aria-hidden="true" />
    <span className="wk-meta-rail__context">{context}</span>
    <i aria-hidden="true" />
    <span className="wk-meta-rail__discipline">{discipline}</span>
  </div>
}
