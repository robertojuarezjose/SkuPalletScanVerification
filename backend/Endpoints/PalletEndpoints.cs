using MAD.WebApi.Entities;
using MAD.WebApi.Models;
using MAD.WebApi.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;

namespace MAD.WebApi.Endpoints;

public static class PalletEndpoints
{

    public static void MapPalletEndpoints(this WebApplication app)
    {
        var palletGroup = app.MapGroup("/api/Pallet");

        palletGroup.MapGet("", Get);
        palletGroup.MapGet("{id:int}", GetById);
        palletGroup.MapGet("by-scan/{scanId:int}", GetPalletsByScanId);
        palletGroup.MapPost("", Create);
        palletGroup.MapPut("", Update);
        palletGroup.MapDelete("{id:int}", Delete);
    }

    private static async Task<IResult> GetPalletsByScanId(int scanId, PalletRepository palletRepository, ScanRepository scanRepository)
    {

        var scan = await scanRepository.Get(scanId);
        if (scan == null)
        {
            return TypedResults.NotFound("Scan not found");
        }

        var pallets = await palletRepository.GetPalletsByScanId(scanId);


        return TypedResults.Ok(pallets);
    }

    private static async Task<IResult> Get(PalletRepository palletRepository)
    {
        var pallet = await palletRepository.Get();
        return TypedResults.Ok(pallet);
    }

    private static async Task<IResult> GetById(int id, PalletRepository palletRepository)
    {
        var pallet = await palletRepository.Get(id);
        return pallet is null ? TypedResults.NotFound() : TypedResults.Ok(pallet);
    }

    private static async Task<Results<Ok<Pallet>, BadRequest<string>>> Create(PalletRequest palletRequest, PalletRepository palletRepository, ScanRepository scanRepository)
    {
        if (palletRequest.ScanId == 0)
        {
            return TypedResults.BadRequest("ScanId is required");
        }

        var scan = await scanRepository.Get(palletRequest.ScanId);
        if (scan == null)
        {
            return TypedResults.BadRequest("Scan not found");
        }

        if (palletRequest.PalletNumber == null)
        {
            palletRequest.PalletNumber = palletRepository.GetNextPalletNumber(palletRequest.ScanId);
        }

        var pallet = new Pallet
        {
            ScanId = palletRequest.ScanId,
            PalletNumber = palletRequest.PalletNumber,
            DateCreated = DateTime.UtcNow
        };

    
        
        var palletResult = await palletRepository.Insert(pallet);
        return TypedResults.Ok(palletResult);
    }

    private static async Task<IResult> Update(Pallet pallet, PalletRepository palletRepository)
    {
        await palletRepository.Update(pallet);
        return TypedResults.Ok();
    }

    private static async Task<IResult> Delete(int id, PalletRepository palletRepository)
    {
        await palletRepository.Delete(id);
        return TypedResults.Ok();
    }
}
