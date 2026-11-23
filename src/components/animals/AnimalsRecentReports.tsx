import Link from 'next/link';
import { fetchRecentReports } from 'kadesh/components/home/server';
import { animalDisplayName } from 'kadesh/components/animals/animalName';
import { getStatusLabel } from 'kadesh/components/animals/constants';
import { Routes } from 'kadesh/core/routes';

/**
 * The newest reports as plain links, painted by the server under the map of `/animales`. The map
 * and its list load in the browser, so without this the HTML had no link to any record and search
 * engines found them only through the sitemap. Same request (and cache, 10 min) as the home page's
 * «Reportes recientes»; nothing is painted if the API fails.
 */
export default async function AnimalsRecentReports() {
  const reports = await fetchRecentReports();
  if (reports.length === 0) return null;

  return (
    <div className="border-t border-[#ececec] bg-[#f7f8fa] dark:border-white/10 dark:bg-night">
      {/* Same edges as the directory's side panel (px-5), full width like the map above. */}
      <section aria-labelledby="reportes-recientes" className="w-full px-5 py-10">
        <h2 id="reportes-recientes" className="text-base font-bold text-[#121212] dark:text-white">
          Reportes recientes
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {reports.map((report) => {
            const name = animalDisplayName({ name: report.name, typeName: report.typeName });
            return (
              <li key={report.id}>
                <Link
                  href={Routes.animals.detail(report.slug || report.id)}
                  className="block rounded-2xl border border-[#ececec] bg-white px-4 py-3 text-sm transition-colors hover:border-kadesh dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
                >
                  <span className="font-semibold text-[#121212] dark:text-white">{name}</span>
                  <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">
                    {' · '}
                    {getStatusLabel(report.status)}
                    {report.place ? ` en ${report.place}` : ''}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
