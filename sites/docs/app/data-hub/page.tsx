import Link from 'next/link';
import { SiteTop } from '../site-top';

const rows = [
  {
    title: 'lartpc foundation model dataset v1',
    href: '/data-hub/lartpc-fm-v1',
    modality: 'lartpc',
    state: 'planned',
    access: 'pending',
  },
  {
    title: 'multi-source cross-detector records',
    href: '#multi-source',
    modality: 'mixed detector',
    state: 'placeholder',
    access: 'pending',
  },
];

export default function DataHubPage() {
  return (
    <main className="site-shell">
      <SiteTop active="data-hub" />
      <article className="home-document">
        <p className="kicker">data hub</p>
        <h1>data hub</h1>
        <p>
          dataset definitions, schemas, access notes, and tutorials for loading
          challenge data. challenge tasks live in <Link href="/challenges">challenges</Link>.
        </p>

        <table>
          <thead>
            <tr>
              <th>dataset</th>
              <th>modality</th>
              <th>state</th>
              <th>access</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                id={row.href.startsWith('#') ? row.href.slice(1) : undefined}
                key={row.href}
              >
                <td>
                  <Link href={row.href}>{row.title}</Link>
                </td>
                <td>{row.modality}</td>
                <td>{row.state}</td>
                <td>{row.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </main>
  );
}
