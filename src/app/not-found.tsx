import Button from "./components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col gap-8 justify-center items-center">
      <h2 className="text-primary text-3xl text-center md:text-7xl font-black">
        404 Página não encontrada
      </h2>
      <p className="text-primary text-xl md:text-4xl text-center">
        Opa! Parece que você se perdeu pelo caminho.
      </p>
      <Button asLink href="/" variant="outlined">
        Voltar a para página inicial
      </Button>
    </div>
  );
}
