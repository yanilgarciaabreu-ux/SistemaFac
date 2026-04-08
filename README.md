<style>
body {
  background-color: #f5f5dc; /* Cream */
  color: #333;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 20px;
}
h1, h2, h3 {
  color: #00008b; /* Blue */
}
h1 {
  text-align: center;
  border-bottom: 2px solid #00008b;
  padding-bottom: 10px;
}
h2 {
  border-left: 5px solid #00008b;
  padding-left: 10px;
}
ul {
  margin-left: 20px;
}
code {
  background-color: #e6e6fa; /* Light blue */
  padding: 2px 4px;
  border-radius: 3px;
}
</style>

# Sistema de Facturación y Contabilidad Avanzado con Firebase

Un sistema avanzado de facturación y contabilidad desarrollado con HTML, CSS (Bootstrap) y JavaScript, utilizando Firestore de Firebase para almacenamiento en la nube.

## Características

- **Gestión de Productos e Inventario**: Agregar productos con nombre, precio y stock inicial. Editar y eliminar productos. Control de inventario al facturar.
- **Presupuestos**: Crear presupuestos con items, cálculo de subtotal, impuesto y total. Guardar y gestionar presupuestos.
- **Facturas**: Crear facturas con control de stock, cálculo de impuestos, comprobante fiscal imprimible.
- **Impuestos**: Configurar tasa de impuesto para presupuestos y facturas.
- **Pagos y Ajustes**:
  - **Recibos de Pago**: Registrar pagos recibidos de clientes.
  - **Notas de Crédito**: Emitir notas para créditos o devoluciones.
  - **Notas de Débito**: Emitir notas para cargos adicionales.
- **Comprobante Fiscal**: Imprimir facturas en formato de comprobante fiscal.
- **Contabilidad**:
  - **Plan de Cuentas**: Gestionar cuentas contables.
  - **Libro Diario**: Registrar asientos contables.
  - **Libros Mayores**: Ver movimientos por cuenta.
  - **Libro de Caja**: Registrar efectivo diario (entradas y salidas).
  - **Libro de Banco**: Controlar dinero en cuenta bancaria (depósitos, transferencias, cheques).
  - **Cuadre de Caja**: Verificar dinero físico vs. registros.
  - **Conciliación Bancaria**: Comparar registros con estado de cuenta.
  - **Reporte de Ingresos y Egresos**: Analizar movimientos financieros.
  - **Control de Ganancias**: Calcular utilidad (ventas - costos - gastos).
  - **Módulo de Impuestos (República Dominicana)**: Calcular ITBIS (18%) cobrado y a pagar.
- **Reportes**: Ver listas de facturas, presupuestos, recibos y notas.
- **Almacenamiento en la Nube**: Todos los datos se guardan en Firestore de Firebase, accesible desde cualquier dispositivo con conexión a internet.

## Cómo usar

1. Abre el archivo `index.html` en tu navegador web (requiere conexión a internet para Firebase).
2. **Productos**: Agrega productos con nombre, precio y stock. Puedes editar o eliminarlos.
3. **Presupuestos**: Crea un presupuesto, agrega items, configura impuesto y guarda.
4. **Facturas**: Crea una factura, agrega items (verifica stock), calcula total con impuesto y guarda. El stock se reduce automáticamente.
5. **Pagos y Ajustes**:
   - Crea recibos de pago para registrar cobros.
   - Emite notas de crédito para ajustes positivos.
   - Emite notas de débito para ajustes negativos.
6. **Contabilidad**:
   - **Plan de Cuentas**: Agrega cuentas con código y nombre.
   - **Libro Diario**: Registra asientos con fecha, descripción, débito y crédito.
   - **Libros Mayores**: Selecciona una cuenta para ver su mayor.
   - **Libro de Caja**: Registra entradas (ventas en efectivo) y salidas (gastos) diarias.
   - **Libro de Banco**: Registra depósitos, transferencias y cheques.
   - **Cuadre de Caja**: Ingresa caja inicial y dinero real para verificar.
   - **Conciliación Bancaria**: Compara balance sistema vs. estado de cuenta.
   - **Reportes Ingresos/Egresos**: Selecciona fechas para ver totales y resultado.
   - **Control de Ganancias**: Calcula utilidad basada en ventas y gastos.
   - **Impuestos (RD)**: Genera reporte de ITBIS cobrado y a pagar.
7. **Reportes**: Ve las listas de facturas, presupuestos, recibos y notas. Busca por cliente. Imprime facturas como comprobantes fiscales.

## Requisitos

- Navegador moderno con soporte para Firebase.
- Conexión a internet para sincronizar datos con Firebase.

## Configuración de Firebase

El proyecto ya está configurado con tu proyecto Firebase. Si necesitas cambiar la configuración, edita el objeto `firebaseConfig` en `script.js`.

**Importante**: Asegúrate de configurar las reglas de Firestore en la consola de Firebase para permitir lecturas y escrituras. Por ejemplo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Esto permite acceso público para demostración. En producción, configura autenticación adecuada.

## Notas

- Los datos se almacenan en Firestore, por lo que son persistentes y accesibles desde múltiples dispositivos.
- Para una presentación en clase, asegúrate de tener conexión a internet.
- Incluye Bootstrap para una interfaz moderna y responsiva.
- El sistema cubre el flujo contable completo: compra de mercancía → inventario → venta → factura → actualización de inventario → registro en caja/banco → gastos → cuadre/conciliación → reportes → cálculo de impuestos y ganancias.