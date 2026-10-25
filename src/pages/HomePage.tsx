import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { site } from '@/content/site'
import { BrushBanner } from '@/components/home/BrushBanner'
import { PortraitCard } from '@/components/home/PortraitCard'
import { StatsSection } from '@/components/home/StatsSection'
import { SiteFooter } from '@/components/layout/SiteFooter'

export default function HomePage() {
  return (
    <>
      <main id="main">
        <section className="relative overflow-hidden pb-16 sm:pb-24" aria-labelledby="hero-heading">
          <BrushBanner className="h-[380px] sm:h-[480px] lg:h-[580px]" />

          <div className="container-page relative isolate">
            <div className="max-w-xl pt-10 sm:pt-14 lg:pt-16">
              <div className="hero-copy relative">
                <div
                  className="absolute -inset-x-6 -inset-y-6 -z-10 rounded-[42px] bg-[radial-gradient(ellipse_at_left,rgba(255,252,245,0.92)_0%,rgba(255,252,245,0.55)_45%,rgba(255,252,245,0)_75%)]"
                  aria-hidden="true"
                />
                <span className="block h-1 w-14 rounded-full bg-brand-red" aria-hidden="true" />
                <h1
                  id="hero-heading"
                  className="mt-5 font-display text-[clamp(1.7rem,3.2vw,2.7rem)] font-semibold leading-[1.4] text-ink"
                >
                  {site.intro.line1}
                  <span className="mt-2 block font-body text-[clamp(1rem,1.9vw,1.3rem)] font-medium leading-8 text-ink/80">
                    {site.intro.line2}
                  </span>
                </h1>
              </div>
            </div>

            <div className="mt-10 grid items-center gap-10 sm:mt-14 lg:mt-20 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-16">
              <PortraitCard className="mx-auto w-full max-w-[350px] animate-fade-up lg:mx-0 lg:max-w-[420px]" />

              <div className="relative animate-fade-up animation-delay-150">
                <div
                  className="slogan-halo absolute -inset-x-8 -inset-y-10 -z-10 rounded-[45%]"
                  aria-hidden="true"
                />
                <h2 className="text-left font-display text-[clamp(2rem,5.1vw,4.4rem)] font-semibold leading-[1.34] text-ink lg:text-right">
                  <span className="block">{site.slogan.line1}</span>
                  <span className="block text-balance">{site.slogan.line2}</span>
                </h2>
                <div className="mt-6 flex lg:justify-end" aria-hidden="true">
                  <span className="block h-2 w-36 rounded-full bg-[linear-gradient(90deg,#D6283E_0%,#D6283E_33%,#F4B400_33%,#F4B400_66%,#0F6B4F_66%,#0F6B4F_100%)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line/70 bg-paper-soft/45 py-16 sm:py-24" aria-labelledby="cta-heading">
          <div className="container-narrow text-center">
            <div className="mx-auto flex w-fit items-center gap-2" aria-hidden="true">
              <span className="h-1.5 w-8 rounded-full bg-brand-red" />
              <span className="h-1.5 w-8 rounded-full bg-brand-yellow" />
              <span className="h-1.5 w-8 rounded-full bg-brand-green" />
            </div>
            <h2 id="cta-heading" className="mt-6 text-2xl font-semibold leading-snug sm:text-3xl">
              {site.cta.line1}
            </h2>
            <p className="mt-2 text-lg text-ink-muted">{site.cta.line2}</p>
            <Link
              to={site.links.submit}
              className="btn-primary mt-8 w-full px-8 text-lg sm:w-auto sm:min-w-[280px]"
            >
              {site.cta.button}
              <ArrowUpRight size={20} strokeWidth={2} aria-hidden="true" />
            </Link>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ink-muted">
              {site.privacy.summary}{' '}
              <Link
                to={site.links.privacy}
                className="font-semibold text-brand-green underline decoration-brand-green/30 underline-offset-4"
              >
                গোপনীয়তা নীতি
              </Link>
            </p>
          </div>
        </section>

        <StatsSection />
      </main>
      <SiteFooter />
    </>
  )
}
