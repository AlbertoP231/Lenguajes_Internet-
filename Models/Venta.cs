using System;
using System.Collections.Generic;

namespace ReactVentas.Models
{
    public partial class Venta
    {
        public Venta()
        {
            DetalleVenta = new HashSet<DetalleVenta>();
        }

        public int idVenta { get; set; }
        public string numeroDocumento { get; set; } = null!;
        public string documentoCliente { get; set; } = null!;
        public string nombreCliente { get; set; } = null!;
        public string tipoDocumento { get; set; } = null!;
        public int idUsuario { get; set; }
        public int idCliente { get; set; }
        public decimal subTotal { get; set; }
        public decimal impuestoTotal { get; set; }
        public decimal total { get; set; }
        public DateTime fechaRegistro { get; set; }

        public virtual Usuario idUsuarioNavigation { get; set; } = null!;
        public virtual Cliente idClienteNavigation { get; set; } = null!;
        public virtual ICollection<DetalleVenta> DetalleVenta { get; set; }
    }
}