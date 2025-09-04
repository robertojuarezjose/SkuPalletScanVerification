using System;

namespace MAD.WebApi.Entities;

public class ScanResults
{
    
    public int ScanId { get; set; }

    public  required string ScanControlNumber { get; set; }
    public int PalletCount { get; set; }

    public int SkuUniqueCount { get; set; }

    public int SkuCount { get; set; }

    public int TotalPieces { get; set; }
    public DateTime DateCreated { get; set; }
    public DateTime? DateFinished { get; set; }

    public Pallet[] Pallets { get; set; } = [];




}
