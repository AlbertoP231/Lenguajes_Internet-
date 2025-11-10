namespace ReactVentas.Models.DTO
{
    public class DtoCliente
    {
        public int idCliente { get; set; }
        public string nombreCompleto { get; set; }
        public string correo { get; set; }
        public string telefono { get; set; }
        public string direccion { get; set; }
        public bool esActivo { get; set; }
        public DateTime fechaRegistro { get; set; }
    }

    public class DtoClienteCreate
    {
        public string nombreCompleto { get; set; }
        public string correo { get; set; }
        public string telefono { get; set; }
        public string direccion { get; set; }
    }
}