"use client";

function Footerdemo() {
  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-center">
            <span>Creado por Adrià Estévez</span>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo };
