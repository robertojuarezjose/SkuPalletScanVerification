using System.Text.RegularExpressions;
using System.Linq;
using MAD.WebApi.Entities;
using MAD.WebApi.Models;
using MAD.WebApi.Repositories;

namespace MAD.WebApi.Endpoints;

public static class SkuEndpoints
{

    public static void MapSkuEndpoints(this WebApplication app)
    {
        var skuGroup = app.MapGroup("/api/Sku");

        skuGroup.MapGet("", Get);
        skuGroup.MapGet("{id:int}", GetById);
        skuGroup.MapPost("", Scan);
        skuGroup.MapGet("by-pallet/{palletId:int}", GetSkusByPalletId);
        skuGroup.MapDelete("{id:int}", Delete);
    }

    private static async Task<IResult> GetSkusByPalletId(int palletId, SkuRepository skuRepository, PalletRepository palletRepository)
    {
        var pallet = await palletRepository.Get(palletId);
        if (pallet == null)
        {
            return TypedResults.NotFound("Pallet not found");
        }

        var skus = await skuRepository.GetSkusByPalletId(palletId);
        return TypedResults.Ok(skus);
    }

    private static async Task<IResult> Get(SkuRepository skuRepository)
    {
        var sku = await skuRepository.Get();
        return TypedResults.Ok(sku);
    }

    private static async Task<IResult> GetById(int id, SkuRepository skuRepository)
    {
        var sku = await skuRepository.Get(id);
        return sku is null ? TypedResults.NotFound() : TypedResults.Ok(sku);
    }

    private static async Task<IResult> Scan(SkuScanRequest request, SkuRepository skuRepository, PalletRepository palletRepository)
    {

        if (request is null)
        {
            return TypedResults.BadRequest("Request body is required");
        }

        var pallet = await palletRepository.Get(request.PalletId);
        if (pallet == null)
        {
            return TypedResults.BadRequest("Pallet not found");
        }

        if (string.IsNullOrWhiteSpace(request.ScanField))
        {
            return TypedResults.BadRequest("ScanField is required");
        }

        var s = request.ScanField.Trim();
        var m = Regex.Match(
            s,
            @"^(?:P(?<sku>[^PQ\r\n]+)Q(?<qty>\d+)|Q(?<qty>\d+)P(?<sku>[^PQ\r\n]+))$",
            RegexOptions.IgnoreCase);

        if (!m.Success)
        {
            return TypedResults.BadRequest("ScanField is invalid. Expected 'P<sku>Q<qty>' or 'Q<qty>P<sku>'.");
        }

        var skuNumber = m.Groups["sku"].Value.Trim();

        if (!int.TryParse(m.Groups["qty"].Value, out var quantity) || quantity <= 0)
        {
            return TypedResults.BadRequest("Quantity must be a positive integer.");
        }

        var sku = new Sku
        {
            Code = skuNumber,
            Quantity = quantity,
            PalletId = request.PalletId
        };

        // Merge by (SkuNumber, PalletId) if it already exists
        var allSkus = await skuRepository.Get();
        var existingSku = allSkus.FirstOrDefault(x =>
            x.PalletId == request.PalletId &&
            !string.IsNullOrWhiteSpace(x.Code) &&
            string.Equals(x.Code, skuNumber, StringComparison.OrdinalIgnoreCase));

        if (existingSku is not null)
        {
            var currentQty = existingSku.Quantity;
            var CurrentScanCount = existingSku.ScanCount;
            existingSku.ScanCount = checked(CurrentScanCount + 1);
            existingSku.Quantity = checked(currentQty + quantity);
            await skuRepository.Update(existingSku);
            return TypedResults.Ok(existingSku);
        }

        // New row
        sku.DateCreated = DateTime.UtcNow;
        await skuRepository.Insert(sku);
        return TypedResults.Ok(sku);

        
    }


    private static async Task<IResult> Delete(int id, SkuRepository skuRepository)
    {
        await skuRepository.Delete(id);
        return TypedResults.Ok();
    }
}
