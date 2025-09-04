using System;

namespace MAD.WebApi.Models;

public class SkuScanRequest
{
    public int PalletId { get; set; }
    

    public required string SkuCode { get; set; }

    public required string Quantity { get; set; }

}
