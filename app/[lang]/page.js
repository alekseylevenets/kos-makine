import { getMachines, getSettings } from "../../lib/data";
import { makeR } from "../../lib/render";

export const revalidate = 60;

export default async function Home({ params }) {
  const { lang } = await params;
  const [machines, settings] = await Promise.all([getMachines(), getSettings()]);
  const R = makeR({ lang, machines, settings });
  return <main id="app" dangerouslySetInnerHTML={{ __html: R.home() }} />;
}
