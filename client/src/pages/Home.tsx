import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ChefHat,
  Earth,
  MapPin,
  Mic,
  Wheat,
} from 'lucide-react';
import { Hero } from '@/components/Hero/Hero';
import { FadeIn, Stagger, StaggerItem } from '@/components/Motion/FadeIn';

export function Home() {
  return (
    <div className="cs-landing-home">
      <Hero />

      <FadeIn className="cs-capabilities" delay={0.05} y={12}>
        <span>
          <Earth size={18} aria-hidden />
          249 country & territory selections
        </span>
        <span>
          <ChefHat size={18} aria-hidden />
          17 development recipes
        </span>
        <span>
          <MapPin size={18} aria-hidden />
          30 city search areas
        </span>
      </FadeIn>

      <section className="cs-section">
        <FadeIn className="cs-section-title">
          <div>
            <p className="cs-overline">HOW WILL YOU CHOW TODAY?</p>
            <h2>
              One appetite.
              <br />A few good ways to begin.
            </h2>
          </div>
          <p>
            Start with a cuisine, a restaurant,
            <br />
            or the ingredients in your kitchen.
          </p>
        </FadeIn>

        <Stagger className="cs-paths">
          <StaggerItem>
            <Link to="/menu-studio" className="cs-path">
              <img
                src="/menus/world/MX.webp"
                alt="Follow your curiosity. AI menu illustration"
                loading="lazy"
              />
              <div>
                <span className="cs-overline">EXPLORE THE WORLD</span>
                <h3>Follow your curiosity.</h3>
                <p>
                  Choose a country and regional style. Explore menu inspiration with your preferences
                  in mind.
                </p>
                <span className="cs-card-link">
                  <Earth size={18} aria-hidden />
                  Explore <ArrowUpRight size={18} aria-hidden />
                </span>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link to="/restaurants" className="cs-path">
              <img
                src="/menus/restaurant/ofada.webp"
                alt="Discover what’s nearby. AI menu illustration"
                loading="lazy"
              />
              <div>
                <span className="cs-overline">FIND A PLACE</span>
                <h3>Discover what’s nearby.</h3>
                <p>
                  Browse checked official menu sources or refresh community listings for a selected
                  city.
                </p>
                <span className="cs-card-link">
                  <MapPin size={18} aria-hidden />
                  Explore <ArrowUpRight size={18} aria-hidden />
                </span>
              </div>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link to="/recipe-lab" className="cs-path">
              <img
                src="/menus/beans.webp"
                alt="Make it work in the kitchen. AI menu illustration"
                loading="lazy"
              />
              <div>
                <span className="cs-overline">PLAN FOR YOUR TABLE</span>
                <h3>Make it work in the kitchen.</h3>
                <p>
                  Scale ingredients, compare estimated nutrition and build a menu from development
                  recipes.
                </p>
                <span className="cs-card-link">
                  <ChefHat size={18} aria-hidden />
                  Explore <ArrowUpRight size={18} aria-hidden />
                </span>
              </div>
            </Link>
          </StaggerItem>
        </Stagger>

        <FadeIn>
          <p className="cs-small">
            Food images are illustrations, not restaurant photographs. Current stock, ingredients and
            dietary suitability need direct confirmation.
          </p>
        </FadeIn>
      </section>

      <FadeIn>
        <section className="cs-bread">
          <div>
            <p className="cs-overline">THE CHOWSMART BREAD COLLECTION</p>
            <h2>
              Five concepts.
              <br />
              Plenty of possibilities.
            </h2>
            <p>
              Meet wheat baguette, wrapped baguette, honey, chocolate and coconut bread ideas. Explore
              proposed recipes, portion calculations and meal pairings.
            </p>
            <Link to="/breads" className="cs-primary">
              Meet the breads <Wheat size={18} aria-hidden />
            </Link>
          </div>
          <Link to="/breads" className="cs-bread-image">
            <img
              src="/breads/wheat-studio.png"
              alt="ChowSmart wheat baguette product concept"
              loading="lazy"
            />
            <span>PRODUCT CONCEPT · PROPOSED RECIPE</span>
          </Link>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="cs-voice">
          <div className="cs-voice-icon">
            <Mic size={38} aria-hidden />
          </div>
          <div>
            <p className="cs-overline">A CONVERSATION ABOUT FOOD</p>
            <h2>Say what you’re craving.</h2>
            <p>
              Use dictation to compose a request, review your words, and explore a spoken menu
              conversation when the AI provider is connected.
            </p>
            <small>
              Live AI and speech-to-speech require a secure provider connection. Availability and
              recognition vary by browser and language.
            </small>
          </div>
          <Link to="/menu-studio" className="cs-secondary">
            Open menu studio <ArrowUpRight size={17} aria-hidden />
          </Link>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="cs-section cs-trust">
          <div>
            <p className="cs-overline">CLEAR ABOUT WHAT WE KNOW</p>
            <h2>
              Food inspiration.
              <br />
              With the details in view.
            </h2>
          </div>
          <div>
            <article>
              <h3>Sources you can visit</h3>
              <p>
                Restaurant profiles link to their own menu sources, with check dates. Map listings are
                community data.
              </p>
            </article>
            <article>
              <h3>Recipes you can inspect</h3>
              <p>
                Nutrition estimates come from ingredient calculations and assumed yields—not from the
                appearance of a photo.
              </p>
            </article>
            <article>
              <h3>Preferences that matter</h3>
              <p>
                Use recipe allergen filters and dietary preferences. Confirmed-halal discovery is
                withheld where branch-level evidence is missing.
              </p>
            </article>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="cs-pctl">
          <div>
            <p className="cs-overline">PART OF PRODUCTS AND CONSUMERS</p>
            <h2>
              Everyday needs.
              <br />
              Connected thinking.
            </h2>
            <p>
              ChowSmart is part of PCTL’s portfolio of retail, consumer and emerging technology
              concepts.
            </p>
          </div>
          <a
            href="https://pctl-portfolio.chessclinique.chatgpt.site"
            className="cs-primary"
            target="_blank"
            rel="noreferrer"
          >
            Explore the PCTL portfolio <ArrowUpRight size={18} aria-hidden />
          </a>
        </section>
      </FadeIn>
    </div>
  );
}
