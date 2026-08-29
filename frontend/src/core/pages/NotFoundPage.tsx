import { ButtonLink } from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="page flex flex-col items-center gap-[0.8rem] py-8 text-center">
      <p aria-hidden="true" className="font-display text-[clamp(5rem,16vw,8rem)] font-semibold leading-none text-cobalt">
        404
      </p>
      <h1 className="text-[clamp(1.5rem,4vw,2rem)]">This page is out of the oven</h1>
      <p className="max-w-[36ch] text-ink-soft">
        The address you opened doesn't match any recipe in the notebook.
      </p>
      <ButtonLink to="/" variant="primary" className="mt-[1.2rem]">
        Back to recipes
      </ButtonLink>
    </div>
  );
}