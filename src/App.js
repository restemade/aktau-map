import React from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ====== Ваши демо-данные ====== */
const sampleObjects = [
  {
    id: "obj-001",
    region: "Мангистауская область",
    city: "Актау",
    name: "Комфортная Школа на 1200 мест (мкрн 20)",
    contractor: "ТОО \"АктауСтрой\"",
    startDate: "2025-04-10",
    endDate: "2026-12-01",
    cost: 12500000000,
    fact: 3500000000,
    planEOY: 5000000000,
    status: "in_progress",
    polygon: [
      [43.684199, 51.144279], [43.682312, 51.143490], [43.681698, 51.145705], [43.683398, 51.146782]
    ],
    photos: {
      bird: ["https://i.ibb.co.com/5gG4y7y7/Whats-App-Image-2025-09-10-at-11-42-58.jpg"],
      ground: ["https://i.ibb.co.com/23nFvRQb/image.jpg"]
    }
  },
  {
    id: "obj-002",
    region: "Мангистауская область",
    city: "Актау",
    name: "Реконструкция набережной (мкрн 15)",
    contractor: "ТОО \"КаспийГрупп\"",
    startDate: "2025-06-01",
    endDate: "2026-08-15",
    cost: 6800000000,
    fact: 1100000000,
    planEOY: 2200000000,
    status: "risk",
    polygon: [
      [43.666184, 51.131821], [43.666001, 51.131208], [43.663378, 51.131794], [43.663404, 51.132832]
    ],
    photos: {
      bird: ["https://i.ibb.co.com/PvpG9VdM/Whats-App-Image-2025-09-10-at-11-41-34.jpg"],
      ground: ["https://i.ibb.co.com/B5LLVZ7x/Whats-App-Image-2025-09-10-at-11-38-02.jpg"]
    }
  },
  {
    id: "obj-003",
    region: "Мангистауская область",
    city: "Актау",
    name: "Детский сад на 320 мест (мкрн 34)",
    contractor: "ТОО \"MangyshlakBuild\"",
    startDate: "2024-10-20",
    endDate: "2025-11-30",
    cost: 2100000000,
    fact: 1600000000,
    planEOY: 1800000000,
    status: "ok",
    polygon: [
      [43.687531, 51.157095], [43.687024, 51.155066], [43.685824, 51.155781], [43.686369, 51.157758]
    ],
    photos: {
      bird: ["https://i.ibb.co.com/8nzrCY2g/Whats-App-Image-2025-09-10-at-11-45-23.jpg"],
      ground: ["https://i.ibb.co.com/wVrC0bt/Whats-App-Image-2025-09-10-at-11-44-44.jpg"]
    }
  }
];

/* ====== Утилиты ====== */
const currency = (n) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "KZT", maximumFractionDigits: 0 })
    .format(n || 0);

const statusColors = {
  risk: { color: "#ef4444", fillColor: "#ef4444" },        // красный
  in_progress: { color: "#3b82f6", fillColor: "#3b82f6" },  // синий
  ok: { color: "#10b981", fillColor: "#10b981" },           // зелёный
};

// Простой центроид под формат [[lat,lng], ...]
function centroid(latlngs) {
  if (!Array.isArray(latlngs) || !latlngs.length) return null;
  let sx = 0, sy = 0;
  for (const [lat, lng] of latlngs) { sx += lat; sy += lng; }
  return [sx / latlngs.length, sy / latlngs.length];
}

/* Миниатюры фото при зуме >= 14 */
function PhotoThumbs({ objects }) {
  const map = useMapEvents({});
  const [zoom, setZoom] = React.useState(map.getZoom());
  React.useEffect(() => {
    const h = () => setZoom(map.getZoom());
    map.on("zoomend", h);
    return () => map.off("zoomend", h);
  }, [map]);

  if (zoom < 14) return null;

  return (
    <>
      {objects.map((o) => {
        const pos = centroid(o.polygon);
        const firstBird = o.photos?.bird?.[0];
        if (!pos || !firstBird) return null;
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:84px;height:56px;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25);border-radius:8px;overflow:hidden"><img src="${firstBird}" style="width:100%;height:100%;object-fit:cover"/></div>`
        });
        return <Marker key={`thumb-${o.id}`} position={pos} icon={icon} />;
      })}
    </>
  );
}

/* Карточка объекта */
function InfoRow({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#6b7280" }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{v}</span>
    </div>
  );
}
function fmtDate(d) {
  try { return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(d)); }
  catch { return d || "—"; }
}
function statusTitle(s) {
  if (s === "ok") return "успешно";
  if (s === "risk") return "риск/отставание";
  return "в процессе";
}
function ObjectCard({ o, onClose }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{o.region} — {o.city}</div>
          <h2 style={{ fontSize: 18, margin: 0 }}>{o.name}</h2>
        </div>
        <button onClick={onClose}>Закрыть</button>
      </div>
      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        <InfoRow k="Подрядчик" v={o.contractor} />
        <InfoRow k="Начало проекта" v={fmtDate(o.startDate)} />
        <InfoRow k="Сдача проекта" v={fmtDate(o.endDate)} />
        <InfoRow k="Себестоимость" v={currency(o.cost)} />
        <InfoRow k="Факт (освоено)" v={currency(o.fact)} />
        <InfoRow k="План до конца года" v={currency(o.planEOY)} />
        <InfoRow k="Статус" v={statusTitle(o.status)} />
        <div>
          <h3 style={{ margin: "12px 0 8px" }}>Фото с птичьего полёта</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(o.photos?.bird || []).map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noreferrer">
                <img src={u} alt="bird" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ margin: "12px 0 8px" }}>Фото объекта</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(o.photos?.ground || []).map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noreferrer">
                <img src={u} alt="ground" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Блок карты */
function MapPart({ objects, setActive, hoverId, setHoverId }) {
  const initialCenter = [43.6481, 51.1722]; // Актау
  return (
    <MapContainer
      center={initialCenter}
      zoom={12.5}
      scrollWheelZoom
      style={{ width: "100%", height: "100vh" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {objects.map((o) => {
        const isHover = hoverId === o.id;
        const sc = statusColors[o.status] || statusColors.in_progress;
        return (
          <Polygon
            key={o.id}
            pathOptions={{
              color: sc.color,
              weight: isHover ? 6 : 3,
              fillColor: sc.fillColor,
              fillOpacity: isHover ? 0.15 : 0.05,
              opacity: 1,
            }}
            positions={o.polygon}
            eventHandlers={{
              mouseover: () => setHoverId(o.id),
              mouseout: () => setHoverId((id) => (id === o.id ? null : id)),
              click: () => setActive(o),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} sticky>
              <div style={{ fontWeight: 600 }}>{o.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{o.contractor}</div>
            </Tooltip>
          </Polygon>
        );
      })}
      <PhotoThumbs objects={objects} />
    </MapContainer>
  );
}

/* Главный компонент */
export default function App() {
  const [objects] = React.useState(sampleObjects);
  const [hoverId, setHoverId] = React.useState(null);
  const [active, setActive] = React.useState(null);

  const totals = React.useMemo(
    () => objects.reduce((a, o) => ({
      cost: a.cost + (o.cost || 0),
      fact: a.fact + (o.fact || 0),
      planEOY: a.planEOY + (o.planEOY || 0)
    }), { cost: 0, fact: 0, planEOY: 0 }),
    [objects]
  );

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        {/* плавающая сводка */}
        <div style={{
          position: "absolute", zIndex: 1000, left: 12, top: 12,
          background: "rgba(255,255,255,0.9)", padding: 12, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,.15)"
        }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Мангистауская область — Актау</div>
          <div style={{ fontSize: 12 }}>Объектов: <b>{objects.length}</b></div>
          <div style={{ fontSize: 12 }}>Себестоимость (всего): <b>{currency(totals.cost)}</b></div>
          <div style={{ fontSize: 12 }}>Факт освоения (всего): <b>{currency(totals.fact)}</b></div>
          <div style={{ fontSize: 12 }}>План до конца года (всего): <b>{currency(totals.planEOY)}</b></div>
        </div>

        <MapPart
          objects={objects}
          setActive={setActive}
          hoverId={hoverId}
          setHoverId={setHoverId}
        />
      </div>

      <aside style={{ width: 380, borderLeft: "1px solid #e5e7eb", background: "#fff", height: "100vh", overflowY: "auto" }}>
        {!active ? (
          <div style={{ padding: 16 }}>
            <h2>Выберите объект на карте</h2>
            <p style={{ color: "#4b5563" }}>
              Наведите курсор для подсветки контура, кликните для подробностей. При приближении появятся миниатюры фото.
            </p>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr" }}>
              <LegendItem color="#10b981" label="Зелёный — успешно" />
              <LegendItem color="#3b82f6" label="Синий — в работе" />
              <LegendItem color="#ef4444" label="Красный — риск/отставание" />
            </div>
            <div style={{ marginTop: 12 }}>
              <h3>Список объектов</h3>
              <ul>
                {objects.map(o => (
                  <li key={`li-${o.id}`} style={{ marginBottom: 8, cursor: "pointer" }} onClick={() => setActive(o)}>
                    <div style={{ fontWeight: 600 }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{o.contractor}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <ObjectCard o={active} onClose={() => setActive(null)} />
        )}
      </aside>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <span style={{ display: "inline-block", width: 12, height: 12, background: color }} />
      <span>{label}</span>
    </div>
  );
}
