'use strict';

const TOKEN = "SECURE_TOKEN_2025";
document.addEventListener("contextmenu", e => e.preventDefault());

// ── Акцент ─────────────────────────────────────────────────
const ACCENTS = ['#294EF1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316'];
let accent;

// ── Часы ───────────────────────────────────────────────────
const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

// ── Водитель / Пассажир ────────────────────────────────────
const DRIVER_CONTROLS = [
  { id:'cl-seat-l',  icon:'icons/seat-heat.svg',  on:'heat_seat_l',  off:'heat_seat_l_0',  max:3 },
  { id:'cl-wheel',   icon:'icons/steering-wheel.svg', on:'heat_wheel_on', off:'heat_wheel_off', max:1 },
  { id:'cl-vent-l',  icon:'icons/seat-vent.svg', on:'vent_seat_l',  off:'vent_seat_l_0',  max:3 },
  { id:'cl-memory', memory:['voditel_seat_1','voditel_seat_2','voditel_seat_3'] },
];

const PASSENGER_CONTROLS = [
  { id:'cl-seat-r', icon:'icons/seat-heat.svg', iconMirrorX: true, on:'heat_seat_r', off:'heat_seat_r_0', max:3 },
  { id:'cl-vent-r', icon:'icons/seat-vent.svg', iconMirrorX: true, on:'vent_seat_r', off:'vent_seat_r_0', max:3 },
];

const climateState = {};

const DRIVER_EXCLUSIVE = {
  'cl-seat-l': 'cl-vent-l',
  'cl-vent-l': 'cl-seat-l',
};

const PASSENGER_EXCLUSIVE = {
  'cl-seat-r': 'cl-vent-r',
  'cl-vent-r': 'cl-seat-r',
};

const CLIMATE_EXCLUSIVE = { ...DRIVER_EXCLUSIVE, ...PASSENGER_EXCLUSIVE };

const SHUTTER_CONTROLS = [
  { id: 'btn-shutter-open', icon: 'icons/car-open.svg', cmd: 'OPEN_SHTORKA', aria: 'Открыть шторку' },
  { id: 'btn-shutter-close', icon: 'icons/car-close.svg', cmd: 'CLOSE_SHTORKA', aria: 'Закрыть шторку' },
];

// ── Мои приложения ─────────────────────────────────────────
const MY_SLOTS = 8;
let pickerSlot = null;

// ── Раскладка приложений ───────────────────────────────────
const LAYOUT = {
  driverCols: 2,
  passengerCols: 2, // сетка климата (1) + блок шторки (1)
  cardGaps: 2,
};
