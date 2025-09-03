using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MAD.WebApi.Entities;

[Table("user_account")]
public class UserAccount
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("full_name")]
    public string? FullName { get; set; }

    [Column("user_name")]
    public string? UserName { get; set; }

    [Column("password")]
    public string? Password { get; set; }

    [Column("role")]
    public string? Role { get; set; }
}