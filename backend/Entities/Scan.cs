using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MAD.WebApi.Entities;

[Table("Scan")]
public class Scan
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("scan_control_number")]
    public string? ScanControlNumber { get; set; }

    [Column("scan_date")]
    public DateTime? ScanDate { get; set; }

    [Column("Scan_finished")]
    public bool? ScanFinished { get; set; }

    [Column("Scan_finished_date")]
    public DateTime? ScanFinishedDate { get; set; }

    

    
    
}
