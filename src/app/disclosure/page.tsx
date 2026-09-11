import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Affiliate disclosure',
  description: `How ${site.name} earns money and why that never changes what gets recommended.`,
  alternates: { canonical: `${site.url}/disclosure` },
};

export default function DisclosurePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-medium text-ink">Affiliate disclosure</h1>
        <div className="mt-4 flex flex-col gap-4 text-sm text-ink">
          <p>{site.disclosure.short}</p>
          <p>
            Some of the links on {site.name} are affiliate links. If you buy something through one of them, I may
            earn a small commission from the retailer — at no extra cost to you. I only link to things I&apos;d
            genuinely recommend anyway; the commission has never changed what I feature or how I describe it.
          </p>
          <p>{site.disclosure.amazonRequired}</p>
          <p>
            {site.name} never processes payments or sees your card details. When you tap Shop now, you&apos;re taken
            to the retailer&apos;s own website to complete your purchase there.
          </p>
          <p className="text-muted">
            Prices shown are what I saw at the time I added each product — retailers change prices often, so please
            check the current price on their site before buying.
          </p>
        </div>
      </main>
    </>
  );
}
