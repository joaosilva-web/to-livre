import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-muted p-6 text-text">
      <div className="flex items-center justify-center gap-2">
        <Image
          src="main-logo.svg"
          alt="Logo de um calendário verde com uma asa lateral no lado esquerdo e um simbolo de correto no meio"
          width={36}
          height={36}
        />
        <h1 className="text-3xl font-bold text-primary">TôLivre</h1>
      </div>
    </div>
  );
}
