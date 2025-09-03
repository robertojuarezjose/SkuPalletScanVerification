using MAD.WebApi.Entities;
using MAD.WebApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace MAD.WebApi.Endpoints;

public static class ScanEndpoints
{
    public static void MapScanEndpoints(this WebApplication app)
    {
        var scanGroup = app.MapGroup("/api/Scan");

        scanGroup.MapGet("", Get);
        scanGroup.MapGet("general-scan-results/{scanId:int}", GetScanResults);
        scanGroup.MapGet("{id:int}", GetById);
        scanGroup.MapPost("", StartScan);
        scanGroup.MapPut("/finish/{scanId:int}", FinishScan);
        scanGroup.MapPut("/continue/{scanId:int}", ContinueScan);
        scanGroup.MapDelete("{id:int}", Delete);
    }

    private static async Task<Results<Ok, NotFound>> ContinueScan(int scanId, ScanRepository scanRepository)
    {
        var scan = await scanRepository.Get(scanId);
        if (scan == null)
        {
            return TypedResults.NotFound();
        }

        scan.ScanFinished = false;
        scan.ScanFinishedDate = null;
        await scanRepository.Update(scan);
        return TypedResults.Ok();
    }

    private static async Task<Results<Ok, NotFound>> FinishScan(int scanId, ScanRepository scanRepository)
    {
        var scan = await scanRepository.Get(scanId);
        if (scan == null)
        {
            return TypedResults.NotFound();
        }

        scan.ScanFinished = true;
        scan.ScanFinishedDate = DateTime.UtcNow;
        await scanRepository.Update(scan);
        return TypedResults.Ok();
    }

    private static async Task<Results<Ok<ScanResults>, NotFound>> GetScanResults(int scanId, ScanRepository scanRepository, PalletRepository palletRepository)
    {
        var scan = await scanRepository.Get(scanId);
        if (scan == null)
        {
            return TypedResults.NotFound();
        }

        var scanResults = await scanRepository.GetScanResults(scanId);

        var pallets = await palletRepository.GetPalletsByScanId(scanId);
        scanResults.Pallets = pallets;
            

        return TypedResults.Ok(scanResults);
    }
    
    private static async Task<Ok<Scan[]>> Get(ScanRepository scanRepository)
    {
        var scan = await scanRepository.Get();
        return TypedResults.Ok(scan);
    }

    [Authorize(Roles = "Administrator, User")]
    private static async Task<Results<Ok<Scan>, NotFound>> GetById(int id, ScanRepository scanRepository)
    {
        var scan = await scanRepository.Get(id);
        return scan is null ? TypedResults.NotFound() : TypedResults.Ok(scan);
    }

    [Authorize(Roles = "Administrator")]
    private static async Task<Results<Ok<Scan>, BadRequest<string>>> StartScan( ScanRepository scanRepository)
    {
        var newScanControlNumber = await scanRepository.GetNewScanControlNumber();
        if (string.IsNullOrEmpty(newScanControlNumber))
        {
            return TypedResults.BadRequest("Failed to generate scan control number");
        }

        var scan = new Scan
        {
            ScanControlNumber = newScanControlNumber,
            ScanDate = DateTime.UtcNow,
            ScanFinished = false,
            ScanFinishedDate = null
        };

        

        
        
        var scanResult = await scanRepository.Insert(scan);
        return TypedResults.Ok(scanResult);
    }

    // private static async Task<Ok> Update(Scan scan, ScanRepository scanRepository)
    // {
    //     await scanRepository.Update(scan);
    //     return TypedResults.Ok();
    // }

    private static async Task<Ok> Delete(int id, ScanRepository scanRepository)
    {
        await scanRepository.Delete(id);
        return TypedResults.Ok();
    }


}
