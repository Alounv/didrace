/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import "./index.css";
import { JSX, lazy } from "solid-js";
import Header from "./components/Header.tsx";
import { Profile } from "./routes/analytics/Analytics.tsx";
import { DiscordCallback } from "./components/DiscordCallback.tsx";
import { ConvexContext } from "./convex-solid.ts";
import convex from "./convex.ts";

const Home = lazy(() => import("./routes/home/Home.tsx"));
const Race = lazy(() => import("./routes/race/Race.tsx"));

const root = document.getElementById("root");

function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="p-10 h-screen flex flex-col gap-8 overflow-x-hidden bg-base-300 text-base-content">
      <Header />
      <div class="flex-1 flex flex-col items-start">{props.children}</div>
    </div>
  );
}

render(
  () => (
    <ConvexContext.Provider value={convex}>
      <Router root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/races/:id" component={Race} />
        <Route path="/profile" component={Profile} />
        <Route path="/api/discord" component={DiscordCallback} />
      </Router>
    </ConvexContext.Provider>
  ),
  root!,
);
