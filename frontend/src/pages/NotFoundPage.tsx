import { ButtonLink } from '../components/Button';

export default function NotFoundPage() {
  return (
    <div className="pagina flex flex-col items-center gap-[0.8rem] py-8 text-center">
      <p aria-hidden="true" className="font-display text-[clamp(5rem,16vw,8rem)] font-semibold leading-none text-cobalto">
        404
      </p>
      <div aria-hidden="true" className="friso mb-[0.8rem] w-36" />
      <h1 className="text-[clamp(1.5rem,4vw,2rem)]">Esta página saiu do forno</h1>
      <p className="max-w-[36ch] text-tinta-suave">
        O endereço que você abriu não corresponde a nenhuma receita do caderno.
      </p>
      <ButtonLink to="/" variant="primario" className="mt-[1.2rem]">
        Voltar para as receitas
      </ButtonLink>
    </div>
  );
}