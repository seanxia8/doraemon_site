import Link from 'next/link';
import { SiteTop } from '../../site-top';

export default function DatasetPage() {
  return (
    <main className="site-shell">
      <SiteTop active="data-hub" />
      <article className="home-document">
        <p className="kicker">data hub</p>
        <h1>lartpc foundation model dataset v1</h1>
        <p>
          planned simulated event-display dataset for foundation-model
          pretraining and downstream reconstruction benchmarks.
        </p>

        <h2>definition</h2>
        <table>
          <tbody>
            <tr>
              <th>state</th>
              <td>planned</td>
            </tr>
            <tr>
              <th>schema</th>
              <td>pending</td>
            </tr>
            <tr>
              <th>download</th>
              <td>pending</td>
            </tr>
            <tr>
              <th>simulation details</th>
              <td>paper link pending</td>
            </tr>
          </tbody>
        </table>

        <h2>used by</h2>
        <p>
          <Link href="/challenges/fm-panoptic-segmentation">
            foundation model panoptic segmentation
          </Link>
        </p>
      </article>
    </main>
  );
}
