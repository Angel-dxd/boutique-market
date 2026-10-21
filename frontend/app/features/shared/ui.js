/**
 * shared/ui.js
 * Componentes visuales compartidos y utilidades de interfaz (Modo Oscuro, Skeletons).
 * Proporciona elementos de carga (skeletons) para mejorar la percepción de velocidad.
 */

/**
 * Genera el HTML de un Skeleton Loader según el tipo de vista.
 * @param {string} type - 'table' | 'cards' | 'calendar'
 * @returns {string} HTML string del skeleton
 */
export const renderSkeleton = (type) => {
    const skeletonClass = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl";

    if (type === 'cards') {
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                ${Array(3).fill(`
                    <div class="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-28 flex flex-col justify-center">
                        <div class="${skeletonClass} h-4 w-1/2 mb-3"></div>
                        <div class="${skeletonClass} h-8 w-1/3"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (type === 'table') {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div class="p-6 border-b border-gray-50 dark:border-gray-700 flex gap-4">
                    <div class="${skeletonClass} h-6 w-1/4"></div>
                    <div class="${skeletonClass} h-6 w-1/4"></div>
                    <div class="${skeletonClass} h-6 w-1/4"></div>
                </div>
                ${Array(5).fill(`
                    <div class="p-4 px-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                        <div class="flex items-center gap-3 w-1/3">
                            <div class="${skeletonClass} h-10 w-10 rounded-full"></div>
                            <div class="${skeletonClass} h-4 w-1/2"></div>
                        </div>
                        <div class="${skeletonClass} h-4 w-1/4"></div>
                        <div class="${skeletonClass} h-4 w-1/4"></div>
                        <div class="flex gap-2">
                            <div class="${skeletonClass} h-8 w-8 rounded-lg"></div>
                            <div class="${skeletonClass} h-8 w-8 rounded-lg"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (type === 'calendar') {
        return `
            <div class="space-y-4 mt-6">
                ${Array(4).fill(`
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div class="flex gap-4">
                            <div class="${skeletonClass} h-12 w-12 rounded-xl"></div>
                            <div class="flex flex-col justify-center gap-2">
                                <div class="${skeletonClass} h-4 w-32"></div>
                                <div class="${skeletonClass} h-3 w-20"></div>
                            </div>
                        </div>
                        <div class="${skeletonClass} h-6 w-16 rounded-full"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return `<div class="${skeletonClass} h-32 w-full"></div>`;
};
