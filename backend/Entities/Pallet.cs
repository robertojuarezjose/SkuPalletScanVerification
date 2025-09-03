using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MAD.WebApi.Entities;

[Table("pallet")]
public class Pallet
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("Scan_Id")]
    public required int ScanId { get; set; }

    [Column("pallet_number")]
    public string? PalletNumber { get; set; }

    [Column("Date_created")]
    public DateTime? DateCreated { get; set; }


}
