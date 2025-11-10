using System;
using System.Collections.Generic;

namespace ReactVentas.Models
{
    public partial class Cliente
    {
        public Cliente()
        {
            Venta = new HashSet<Venta>();
        }

        public int idCliente { get; set; }
        public string nombreCompleto { get; set; } = null!;
        public string correo { get; set; } = null!;
        public string telefono { get; set; } = null!;
        public string direccion { get; set; } = null!;
        public bool esActivo { get; set; }
        public DateTime fechaRegistro { get; set; }

        public virtual ICollection<Venta> Venta { get; set; }
    }
}