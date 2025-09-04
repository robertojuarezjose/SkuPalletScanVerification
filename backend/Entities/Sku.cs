using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MAD.WebApi.Entities;

[Table("sku")]
public class Sku
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("code")]
    public required string Code { get; set; }

    [Column("quantity")]
    public required int Quantity { get; set; }

    [Column("pallet_id")]
    public required int PalletId  { get; set; }

    [Column("ScanCount")]
    public int ScanCount { get; set; }

    [Column("Date_created")]
    public DateTime? DateCreated { get; set; }

    
}

