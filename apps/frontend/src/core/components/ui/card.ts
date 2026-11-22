/**
 * Receitas de card do tema — fonte única de raio, borda, superfície e sombra.
 * Cards de seção (AccountPage, RecipeDetailPage) usam `sectionCardClasses`;
 * painéis centralizados de formulário (Login, Register, New recipe) usam
 * `formCardClasses`.
 */
export const cardClasses = 'rounded-xl border border-border bg-surface shadow-card';

export const sectionCardClasses = `${cardClasses} px-[1.8rem] py-[1.6rem]`;

export const formCardClasses = `${cardClasses} px-[2.2rem] py-8`;
