import Link from "next/link";

export default function ForWhom() {
  return (
    <section id="who" className="py-24 bg-gray-50 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">
          Perfeito para quem vive de agenda
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-left text-lg font-medium">
          <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition">
            <span className="text-4xl">💈</span>
            <p className="text-center text-text">Barbeiros e cabeleireiros</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition">
            <span className="text-4xl">💅</span>
            <p className="text-center text-text">Manicures e esteticistas</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition">
            <span className="text-4xl">🧠</span>
            <p className="text-center text-text">Psicólogos e terapeutas</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition">
            <span className="text-4xl">📸</span>
            <p className="text-center text-text">Fotógrafos e freelancers</p>
          </div>
        </div>

        <p className="text-text text-lg mt-10 max-w-xl mx-auto">
          Não importa sua profissão. Se você atende com horário marcado, o
          TôLivre é pra você.
        </p>

        <div className="mt-8">
          <Link
            href="/leads"
            className="bg-primary text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-primary-hover hover:scale-105 transition"
          >
            Comece a usar gratuitamente
          </Link>
        </div>
      </div>
    </section>
  );
}
