import { useLocation, useNavigate } from 'react-router';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@/core/components/ui/Tabs';
import { formCardClasses } from '@/core/components/ui/card';

type AuthTabValue = 'login' | 'register';

/**
 * Card das telas de autenticação: abas Sign in / Sign up sobre um único card.
 * A aba ativa é derivada da rota (`/login` ou `/register`) e trocar de aba
 * navega — deep links e o botão voltar funcionam como rotas separadas.
 * Os painéis ficam montados (`keepMounted`) para o que o usuário digitou não
 * se perder ao alternar.
 */
export default function AuthTabsCard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const value: AuthTabValue = pathname.endsWith('/register') ? 'register' : 'login';

  return (
    <TabsRoot
      value={value}
      onValueChange={(next: string) => {
        navigate(next === 'register' ? '/register' : '/login');
      }}
    >
      <section className={`mx-auto flex w-full flex-col gap-[1.3rem] ${formCardClasses}`}>
        <TabsList aria-label="Sign in or create an account">
          <TabsTab value="login">Sign in</TabsTab>
          <TabsTab value="register">Sign up</TabsTab>
        </TabsList>
        <TabsPanel value="login" keepMounted>
          <LoginForm />
        </TabsPanel>
        <TabsPanel value="register" keepMounted>
          <RegisterForm />
        </TabsPanel>
      </section>
    </TabsRoot>
  );
}
