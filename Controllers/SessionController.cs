using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using System.Security.Cryptography;
using System.Text;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public SessionController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        private string EncriptarClave(string clave)
        {
            if (string.IsNullOrEmpty(clave))
                return string.Empty;

            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(clave));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.correo) || string.IsNullOrEmpty(request.clave))
                    return BadRequest("Credenciales inválidas");

                // Encriptar la contraseña recibida
                string claveEncriptada = EncriptarClave(request.clave);

                var usuario = _context.Usuarios
                    .Include(u => u.IdRolNavigation)
                    .FirstOrDefault(u => u.Correo == request.correo && u.Clave == claveEncriptada && u.EsActivo == true);

                if (usuario == null)
                    return Unauthorized("Credenciales inválidas");

                // Devuelvo un DTO con claves en camelCase para que el frontend (JS) encuentre `idUsuario`, `nombre`, etc.
                var result = new
                {
                    idUsuario = usuario.IdUsuario,
                    nombre = usuario.Nombre,
                    correo = usuario.Correo,
                    telefono = usuario.Telefono,
                    idRol = usuario.IdRol,
                    esActivo = usuario.EsActivo,
                    idRolNavigation = usuario.IdRolNavigation != null
                        ? new { idRol = usuario.IdRolNavigation.IdRol, descripcion = usuario.IdRolNavigation.Descripcion }
                        : null
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("crear")]
        public IActionResult CrearUsuario([FromBody] UsuarioCreateRequest request)
        {
            try
            {
                // Validaciones
                if (request == null)
                    return BadRequest("Datos inválidos");

                if (string.IsNullOrEmpty(request.nombre) || string.IsNullOrEmpty(request.correo) || string.IsNullOrEmpty(request.clave))
                    return BadRequest("Todos los campos son requeridos");

                // Verificar si el correo ya existe (ignorar mayúsculas/minúsculas)
                var usuarioExistente = _context.Usuarios
                    .FirstOrDefault(u => u.Correo.ToLower() == request.correo.ToLower());

                if (usuarioExistente != null)
                    return BadRequest("El correo ya está registrado");

                // Encriptar contraseña
                string claveEncriptada = EncriptarClave(request.clave);

                // Crear usuario
                var usuario = new Usuario
                {
                    Nombre = request.nombre,
                    Correo = request.correo,
                    Clave = claveEncriptada,
                    IdRol = request.idRol,
                    Telefono = request.telefono,
                    EsActivo = true,
                    FechaCreacion = DateTime.Now
                };

                _context.Usuarios.Add(usuario);
                _context.SaveChanges();

                return Ok($"Usuario {request.nombre} creado exitosamente");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }

    public class UsuarioCreateRequest
    {
        public string nombre { get; set; }
        public string correo { get; set; }
        public string clave { get; set; }
        public int idRol { get; set; }
        public string telefono { get; set; }
    }

    public class LoginRequest
    {
        public string correo { get; set; }
        public string clave { get; set; }
    }
}