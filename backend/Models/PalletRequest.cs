using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MAD.WebApi.Models;

public class PalletRequest
{
    [Column("Scan_Id")]
    public required int ScanId { get; set; }

    [Column("pallet_number")]
    public string? PalletNumber { get; set; }

}
