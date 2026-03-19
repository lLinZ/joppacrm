<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Expense;

class ExcelDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ==========================================
        // 1. CATEGORIES
        // ==========================================
        $supplierCatNames = ['Franelas', 'Franelas Oversize', 'Impresión DTF', 'Bolsas', 'Papel seda', 'Maquinas'];
        $supplierCategories = [];
        foreach ($supplierCatNames as $name) {
            $supplierCategories[$name] = Category::firstOrCreate(['name' => $name, 'type' => 'supplier']);
        }

        $productCatNames = ['TERRY SPUN', '100% ALGODON', 'JERSEY 20/1'];
        $productCategories = [];
        foreach ($productCatNames as $name) {
            $productCategories[$name] = Category::firstOrCreate(['name' => $name, 'type' => 'product']);
        }

        $expenseCatNames = ['DTF', 'Franela', 'Máquinas', 'Diseño', 'Empaque', 'Marketing'];
        $expenseCategories = [];
        foreach ($expenseCatNames as $name) {
            $expenseCategories[$name] = Category::firstOrCreate(['name' => $name, 'type' => 'expense']);
        }

        // ==========================================
        // 2. SUPPLIERS
        // ==========================================
        $suppliersData = [
            [
                'name' => 'Chesed',
                'category_id' => $supplierCategories['Franelas']->id,
                'phone' => '58 424-4337841',
                'address' => 'San Diego',
                'instagram' => 'Chesed.vg',
                'reliability' => 4,
                'notes' => 'Notas',
                'wholesale_price' => '5,8 a partir de 12',
                'platform' => 'Facebook Marketplace',
                'last_purchase_notes' => '10/03 pedido de 12 franelas',
            ],
            [
                'name' => 'Spod',
                'category_id' => $supplierCategories['Franelas Oversize']->id,
                'phone' => '58 414-4010733',
                'address' => 'San Diego',
                'instagram' => 'spod.ve',
                'reliability' => 5,
                'notes' => '210g de algodon',
                'wholesale_price' => '12 x $90 - $7.5c/u, 25 x $137.5 - $5.5 c/u',
                'platform' => 'Whatsapp Business',
                'last_purchase_notes' => '17/03 pedido 6 franelas Overs',
            ],
            [
                'name' => 'Chesed DTF', // Saved distinctly
                'category_id' => $supplierCategories['Impresión DTF']->id,
                'phone' => '58 424-4337841',
                'address' => 'San Diego',
                'instagram' => 'Chesed.vg',
                'reliability' => 5,
                'notes' => '30cm de ancho',
                'wholesale_price' => '1mt x 30cm - 12$',
                'platform' => 'Facebook Marketplace',
                'last_purchase_notes' => '09/03 pedido de 1 metro',
            ],
            [
                'name' => 'Vaco',
                'category_id' => $supplierCategories['Bolsas']->id,
                'phone' => '58 412-2885376',
                'address' => 'Guaparo',
                'instagram' => 'vacoimpresos',
                'reliability' => null,
                'notes' => 'Papel kraft 150gr. Impresion de logo a full color a ambas caras. Asa en cinta raso, gross, cordon o hilladilla',
                'wholesale_price' => 'A partir de 24uni. 2$ c/u. A partir de 120uni - 1,8$ c/u',
                'platform' => 'Instagram',
                'last_purchase_notes' => '',
            ],
            [
                'name' => 'Andrea Mendez',
                'category_id' => $supplierCategories['Papel seda']->id,
                'phone' => '58 412-4686512',
                'address' => 'Valles De C...',
                'instagram' => '',
                'reliability' => null,
                'notes' => '',
                'wholesale_price' => '10$ la resma de 100 unidades',
                'platform' => 'Facebook Marketplace',
                'last_purchase_notes' => '',
            ],
            [
                'name' => 'El castillo',
                'category_id' => $supplierCategories['Maquinas']->id,
                'phone' => '',
                'address' => 'Lugar',
                'instagram' => '',
                'reliability' => 5,
                'notes' => 'Mini plancha de sublimacion',
                'wholesale_price' => '360$ la plancha y la mini plancha 43,90$',
                'platform' => '',
                'last_purchase_notes' => '18/03',
            ],
        ];

        $suppliers = [];
        foreach ($suppliersData as $data) {
            $suppliers[$data['name']] = Supplier::create($data);
        }

        // ==========================================
        // 3. PRODUCTS (INVENTORY)
        // ==========================================
        $productsData = [
            ['name' => 'Franela Negra', 'style' => 'Oversize', 'category' => 'TERRY SPUN', 'price' => 18.00, 's' => 0, 'm' => 1, 'l' => 1],
            ['name' => 'Franela Negra', 'style' => 'Normal', 'category' => '100% ALGODON', 'price' => 15.00, 's' => 2, 'm' => 2, 'l' => 2],
            ['name' => 'Franela Blanca', 'style' => 'Oversize', 'category' => '100% ALGODON', 'price' => 18.00, 's' => 1, 'm' => 0, 'l' => 0],
            ['name' => 'Franela Blanca', 'style' => 'Normal', 'category' => '100% ALGODON', 'price' => 15.00, 's' => 1, 'm' => 1, 'l' => 1],
            ['name' => 'Franela Beige', 'style' => 'Oversize', 'category' => 'JERSEY 20/1', 'price' => 18.00, 's' => 0, 'm' => 2, 'l' => 0],
            ['name' => 'Franela Beige', 'style' => 'Normal', 'category' => '100% ALGODON', 'price' => 15.00, 's' => 1, 'm' => 1, 'l' => 1],
            ['name' => 'Franela Azul Marino', 'style' => 'Oversize', 'category' => 'JERSEY 20/1', 'price' => 18.00, 's' => 0, 'm' => 1, 'l' => 0],
        ];

        foreach ($productsData as $item) {
            Product::create([
                'name' => $item['name'],
                'style' => $item['style'],
                'fabric_type' => $item['category'], // Not using category_id just directly string as seen in old models if fabric_type serves this
                'category_id' => $productCategories[$item['category']]->id,
                'price' => $item['price'],
                'cost' => collect([$item['price'] / 2, 0])->max(), // Fake cost
                'size_s' => $item['s'],
                'size_m' => $item['m'],
                'size_l' => $item['l'],
                'quantity' => $item['s'] + $item['m'] + $item['l'],
                'min_stock' => 0,
            ]);
        }

        // ==========================================
        // 4. EXPENSES
        // ==========================================
        $expensesData = [
            [
                'date' => '2026-03-09',
                'description' => '1 metro de DTF',
                'category_id' => $expenseCategories['DTF']->id,
                'amount' => 12.00,
                'supplier_id' => $suppliers['Chesed DTF']->id,
                'order_details' => 'Se pidieron 4 diseños impresos por el espacio',
                'notes' => 'Pago en bs (6,020.74)',
            ],
            [
                'date' => '2026-03-10',
                'description' => '12 franelas de algodon',
                'category_id' => $expenseCategories['Franela']->id,
                'amount' => 70.00,
                'supplier_id' => $suppliers['Chesed']->id,
                'order_details' => '6 negras (1 talla S, 1 talla M y 1 talla L) 3 beige (1 talla S, 1 talla M, 1 talla L). 3 blancas (1 talla S, 1 talla M, 1 talla L)',
                'notes' => 'Pago 40$ en divisas, y 30$ al bcv euro al recogerlas',
            ],
            [
                'date' => '2026-03-14',
                'description' => 'Plancha 38x38',
                'category_id' => $expenseCategories['Máquinas']->id,
                'amount' => 360.00,
                'supplier_id' => $suppliers['El castillo']->id,
                'order_details' => 'Se compró la plancha 38x38 para estampados de diseños en franelas',
                'notes' => 'Pago 360$ en bs (145.209,99). Hasta el momento se le debe a Cashea 1968',
            ],
            [
                'date' => '2026-03-17',
                'description' => '6 franelas Oversize',
                'category_id' => $expenseCategories['Franela']->id,
                'amount' => 39.00,
                'supplier_id' => $suppliers['Spod']->id,
                'order_details' => '1 azul marino Jersey (talla M), 2 beige Jersey (talla S y M), 2 negras terry (talla M y L), 1 blanca 100% algodon (talla S)',
                'notes' => 'Pago 33 usdt + 6 usdt en deliver: 39 usdt',
            ],
            [
                'date' => '2026-03-17',
                'description' => 'Un mes de Vectorizer AI',
                'category_id' => $expenseCategories['Diseño']->id,
                'amount' => 10.00,
                'supplier_id' => null,
                'order_details' => 'Se pago un mes de Vectorizer AI para las vectorizaciones automaticas de los disenos',
                'notes' => 'Pago a traves de zinlii',
            ],
            [
                'date' => '2026-03-18',
                'description' => 'Bolsas kraft',
                'category_id' => $expenseCategories['Empaque']->id,
                'amount' => 48.00,
                'supplier_id' => $suppliers['Vaco']->id,
                'order_details' => 'Se pidieron 24 unidades de bolsas kraft tamaño mediano 30x21x12 con asas de cordón negro',
                'notes' => 'Pago 48 bs Euro (24.990,82)',
            ],
            [
                'date' => '2026-03-18',
                'description' => 'Plancha mini sublimación',
                'category_id' => $expenseCategories['Máquinas']->id,
                'amount' => 43.90,
                'supplier_id' => $suppliers['El castillo']->id,
                'order_details' => 'Se compró la mini plancha para estampados de etiquetas y logos',
                'notes' => 'Pago 43,90 en bs BCV',
            ],
            [
                'date' => '2026-03-18',
                'description' => 'Servidor',
                'category_id' => $expenseCategories['Marketing']->id,
                'amount' => 120.00,
                'supplier_id' => null,
                'order_details' => 'Servidor y dominio de la pagina web',
                'notes' => 'Pago 120$ a través de Zinlii',
            ],
            [
                'date' => '2026-03-18',
                'description' => 'Correo corporativo',
                'category_id' => $expenseCategories['Marketing']->id,
                'amount' => 5.40,
                'supplier_id' => null,
                'order_details' => 'Correo electrónico gmail',
                'notes' => 'Pago 5,40$ a través de Zinlii',
            ],
        ];

        foreach ($expensesData as $expense) {
            Expense::create(array_merge($expense, [
                'currency' => 'USD',
                'exchange_rate_value' => null
            ]));
        }
    }
}
