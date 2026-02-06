const renderTools = () => {
    const content = document.getElementById('content');

    content.innerHTML = `
        <h1 class="text-3xl font-black text-slate-800 mb-8">Herramientas</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Margin Calculator -->
            <div class="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <h2 class="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
                    <i data-lucide="calculator"></i> Calculadora de Precios
                </h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Costo Producto (€)</label>
                        <input type="number" id="calc-cost" class="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none focus:border-indigo-500" placeholder="0.00">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Margen Deseado (%)</label>
                        <input type="number" id="calc-margin" class="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none focus:border-indigo-500" placeholder="Ej: 30" value="30">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">IVA (%)</label>
                        <input type="number" id="calc-tax" class="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none focus:border-indigo-500" placeholder="Ej: 21" value="21">
                    </div>
                    
                    <button onclick="calculatePrice()" class="w-full py-4 bg-slate-900 text-white rounded-xl font-black mt-4 hover:opacity-90 transition-opacity">
                        CALCULAR PVP
                    </button>
                </div>

                <div id="calc-result" class="mt-8 hidden animate-in fade-in slide-in-from-bottom-4">
                    <div class="p-6 bg-indigo-50 rounded-2xl text-center border border-indigo-100">
                        <span class="block text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">Precio de Venta Recomendado</span>
                        <span id="result-price" class="text-4xl font-black text-indigo-600">0.00€</span>
                    </div>
                </div>
            </div>

            <!-- Placeholder for future tools -->
             <div class="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <i data-lucide="wrench" size="48" class="mb-4 opacity-50"></i>
                <p class="font-bold">Más herramientas próximamente...</p>
            </div>
        </div>
    `;
    lucide.createIcons();
};

const calculatePrice = () => {
    const cost = parseFloat(document.getElementById('calc-cost').value) || 0;
    const margin = parseFloat(document.getElementById('calc-margin').value) || 0;
    const tax = parseFloat(document.getElementById('calc-tax').value) || 0;

    if (cost <= 0) return;

    // Logic: Cost + Margin% + Tax%
    const priceWithMargin = cost + (cost * (margin / 100));
    const finalPrice = priceWithMargin + (priceWithMargin * (tax / 100));

    const resultDiv = document.getElementById('calc-result');
    const priceSpan = document.getElementById('result-price');

    priceSpan.textContent = finalPrice.toFixed(2) + '€';
    resultDiv.classList.remove('hidden');
};
