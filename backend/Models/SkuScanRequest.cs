using System;

namespace MAD.WebApi.Models;

public class SkuScanRequest
{
    public int PalletId { get; set; }
    public required string ScanField { get; set; }

}
