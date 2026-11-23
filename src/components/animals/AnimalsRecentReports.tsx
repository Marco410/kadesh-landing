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
    <div className="bg-[#f7f8fa] dark:bg-night">
      <section aria-labelledby="reportes-recientes" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 id="reportes-recientes" className="text-base font-bold text-[#121212] dark:text-white">
          Reportes recientes
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
