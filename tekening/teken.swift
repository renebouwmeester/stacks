// Tekening 1 (26 okt 2026): rugkleuren berekend uit de Roon-hoes naast Apple's eigen rugkleuren, voor René.
// De rug is overgenomen uit Basso's StapelRug (Stapel.swift): dikte naar speelduur, verloop eroverheen, artiest
// semibold, titel regular, catalogusnummer in een eigen rechterkolom (variant D uit tekenbank/koppen/catno.swift).
// Gebruik: node tekening/bereken.js && swift tekening/teken.swift tekening   → tekening/ruggen.png
import SwiftUI
import AppKit

let map = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "."
let data = try! Data(contentsOf: URL(fileURLWithPath: map + "/tekening.json"))
let albums = try! JSONSerialization.jsonObject(with: data) as! [[String: Any]]

func kleur(_ hex: Any?) -> Color? {
    guard let hex = hex as? String, let v = Int(hex, radix: 16) else { return nil }
    return Color(red: Double((v >> 16) & 255) / 255, green: Double((v >> 8) & 255) / 255, blue: Double(v & 255) / 255)
}
func seconden(_ s: String?) -> Double {
    (s ?? "").split(separator: ":").compactMap { Double($0) }.reduce(0) { $0 * 60 + $1 }
}

struct Album {
    let artiest, titel, duur: String
    let catno: String?
    let sec: Double
    let hoes: NSImage?
    let eigen: (Color, Color, Color)
    let apple: (Color, Color, Color)?
    let waarom: String
    init(_ a: [String: Any]) {
        // Roon schrijft samenwerkingen als "A/B/C"; op de rug zoals Apple: "A, B & C".
        let namen = (a["artist"] as? String ?? "").split(separator: "/").map { $0.trimmingCharacters(in: .whitespaces) }
        artiest = namen.count > 1 ? namen.dropLast().joined(separator: ", ") + " & " + namen.last! : namen.first ?? ""
        titel = a["title"] as? String ?? ""
        catno = a["catno"] as? String
        sec = seconden(a["length"] as? String)
        let m = Int((sec / 60).rounded())
        duur = m >= 60 ? (m % 60 == 0 ? "\(m / 60) hr" : "\(m / 60) hr \(m % 60) min") : "\(m) min"
        hoes = NSImage(contentsOfFile: map + "/" + (a["hoes"] as? String ?? ""))
        let e = a["eigen"] as! [String: Any]
        eigen = (kleur(e["bg"])!, kleur(e["t1"])!, kleur(e["t2"])!)
        if let k = a["apple_kleur"] as? [String: Any], let bg = kleur(k["bg"]) {
            apple = (bg, kleur(k["t1"]) ?? .white, kleur(k["t2"]) ?? .white)
        } else { apple = nil }
        let w = e["waarom"] as! [String: Any]
        let rand = Int(((w["randAandeel"] as? Double) ?? 0) * 100)
        waarom = (w["bron"] as? String) == "edge" ? "edge colour · \(rand)% of the border" : "no clear edge (\(rand)%) · dominant colour"
    }
}

let rijen = albums.map(Album.init)

struct Rug: View {
    let a: Album
    let k: (Color, Color, Color)
    var body: some View {
        let dikte = 22 + CGFloat(min(max(a.sec / 60 - 20, 0), 80) / 80 * 20)
        HStack(spacing: 12) {
            Text(a.artiest).font(.system(size: 12, weight: .semibold)).foregroundStyle(k.1).lineLimit(1)
            Text(a.titel).font(.system(size: 12)).foregroundStyle(k.2).lineLimit(1)
            Spacer(minLength: 8)
            Text(a.duur).font(.system(size: 11).monospacedDigit()).foregroundStyle(k.2.opacity(0.8))
            Text(a.catno ?? "").font(.system(size: 10, weight: .medium).monospacedDigit()).tracking(0.4)
                .foregroundStyle(k.2.opacity(0.7)).lineLimit(1).frame(width: 96, alignment: .trailing)
        }
        .padding(.horizontal, 16).frame(height: dikte)
        .background { k.0.overlay(LinearGradient(colors: [.white.opacity(0.10), .clear, .black.opacity(0.18)], startPoint: .top, endPoint: .bottom)) }
    }
}

struct Leeg: View {
    var body: some View {
        Text("Not on Apple Music").font(.system(size: 11)).foregroundStyle(.white.opacity(0.35))
            .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16).frame(height: 26)
            .overlay(RoundedRectangle(cornerRadius: 2).strokeBorder(.white.opacity(0.12), style: StrokeStyle(lineWidth: 1, dash: [3, 3])))
    }
}

let zacht = Color.white.opacity(0.45)
let breedte: CGFloat = 820

let vergelijking = VStack(alignment: .leading, spacing: 18) {
    HStack(spacing: 16) {
        Color.clear.frame(width: 64, height: 1)
        Text("FROM THE ROON COVER").frame(width: breedte, alignment: .leading)
        Text("APPLE MUSIC").frame(width: breedte, alignment: .leading)
    }
    .font(.system(size: 10, weight: .semibold)).tracking(1.2).foregroundStyle(zacht)
    ForEach(rijen.indices, id: \.self) { i in
        let a = rijen[i]
        HStack(alignment: .top, spacing: 16) {
            Group {
                if let h = a.hoes { Image(nsImage: h).resizable().aspectRatio(contentMode: .fill) } else { Color.gray }
            }
            .frame(width: 64, height: 64).clipShape(RoundedRectangle(cornerRadius: 3))
            VStack(alignment: .leading, spacing: 5) {
                Rug(a: a, k: a.eigen)
                Text(a.waarom).font(.system(size: 10)).foregroundStyle(zacht)
            }.frame(width: breedte)
            Group { if let k = a.apple { Rug(a: a, k: k) } else { Leeg() } }.frame(width: breedte)
        }
    }
}

// De stapel zelf, op catalogusnummer: de hoofdzaak van de forumvraag. Zonder nummer onderaan, op artiest.
let opNummer = rijen.sorted {
    switch ($0.catno, $1.catno) {
    case let (x?, y?): return x.localizedStandardCompare(y) == .orderedAscending
    case (_?, nil): return true
    case (nil, _?): return false
    default: return $0.artiest < $1.artiest
    }
}
let stapel = VStack(alignment: .leading, spacing: 10) {
    Text("THE STACK, SORTED BY CATALOGUE NUMBER").font(.system(size: 10, weight: .semibold)).tracking(1.2).foregroundStyle(zacht)
    VStack(spacing: 1) { ForEach(opNummer.indices, id: \.self) { Rug(a: opNummer[$0], k: opNummer[$0].eigen) } }.frame(width: breedte)
}

await MainActor.run {
    let vel = VStack(alignment: .leading, spacing: 44) {
        VStack(alignment: .leading, spacing: 6) {
            Text("Spine colours from Roon covers").font(.system(size: 22, weight: .semibold)).foregroundStyle(.white.opacity(0.9))
            Text("Left: computed from the cover Roon serves. Right: Apple's own colours for the same album")
                .font(.system(size: 13)).foregroundStyle(zacht)
        }
        vergelijking
        stapel
    }
    .padding(40).background(Color(red: 0.051, green: 0.051, blue: 0.063))
    let r = ImageRenderer(content: vel.environment(\.colorScheme, .dark)); r.scale = 2
    if let ns = r.nsImage, let t = ns.tiffRepresentation, let rep = NSBitmapImageRep(data: t), let png = rep.representation(using: .png, properties: [:]) {
        try? png.write(to: URL(fileURLWithPath: map + "/ruggen.png")); print("getekend:", rijen.count, "albums")
    }
}
