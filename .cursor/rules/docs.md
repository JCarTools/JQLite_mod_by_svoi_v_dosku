# JCarTools Web API

Документация API для HTML-экранов JCarTools.

- HTML-версия документации: [`index.html`](./index.html)
- Разделы: [чёрный экран](#чёрный-экран), [приборная панель / HUD](#приборная-панель--hud)

## Чёрный экран

Чёрный экран работает внутри Android WebView. Со стороны JS доступен объект:

```js
window.androidApi
```

Почти все методы принимают первым аргументом токен:

```js
const TOKEN = "SECURE_TOKEN_2025";
```

После загрузки страницы нужно сообщить Android, что JS готов принимать события:

```js
window.androidApi.onJsReady(TOKEN);
```

## JS -> Android

| Метод | Возврат | Назначение |
| --- | --- | --- |
| `onJsReady(token)` | `void` | Сообщить Android, что страница готова принимать события. |
| `onClose(token)` | `void` | Закрыть чёрный экран. |
| `onSettings(token)` | `void` | Открыть настройки текущего веб-экрана. |
| `runEnum(token, enumName)` | JSON string | Запустить встроенную команду по имени. |
| `getRunEnum(token)` | JSON string | Получить список доступных команд `runEnum`. |
| `getRunEnumPic(token, enumName)` | string | Получить иконку команды в base64. |
| `runApp(token, packageName)` | JSON string | Запустить приложение по package name. |
| `getUserApps(token)` | JSON string | Получить список пользовательских приложений. |
| `getAppInfo(token, packageName)` | JSON string | Получить название и иконку приложения. |
| `setvol(token, value)` | `void` | Установить громкость. |
| `getvol(token)` | number | Получить текущую media-громкость в процентах. |
| `getCarData(token, name)` | JSON string | Получить данные автомобиля по имени запроса. |
| `carCommand(token, json)` | JSON string | Выполнить JSON-команду текущего `CarCmdProxy.c(...)`. |
| `carCmd(token, json)` | JSON string | Короткий alias для `carCommand(...)`. |
| `getFileList(token)` | JSON string | Получить список файлов из Downloads. |
| `getFile(token, name)` | string | Получить файл из Downloads в base64. |
| `setLogFilter(token, q1, q2, q3)` | `void` | Задать до трёх фильтров для чтения строк из автомобильных логов. |
| `pingEvent(token)` | `void` | Проверить обратную отправку события в JS. |
| `setBright(token, value)` | `void` | Передать значение яркости/прозрачности `0..100`. |
| `runJson(token, json)` | JSON string | Резервный метод для сложных JSON-команд. |

## Получение данных

### `setvol(token, value)`

Устанавливает media-громкость в процентах. `value` считается процентом `0..100`; значения ниже `0` прижимаются к `0`, выше `100` - к `100`.

```js
window.androidApi.setvol(TOKEN, 65);
```

### `getvol(token)`

Возвращает текущую media-громкость числом `0..100`. При ошибке возвращает `-1`.

```js
const volume = window.androidApi.getvol(TOKEN);
```

Пример ответа:

```json
85
```

### `getCarData(token, name)`

Возвращает JSON-строку с данными автомобиля. Метод только читает данные из `CarCmdProxy`; управляющие команды через него не выполняются.

Часть данных может приходить через универсальные JSON-команды `CarCmdProxy.c(...)`. Например, для топлива используется команда `get_fuel_percent`, если текущий автомобильный proxy её поддерживает.

Доступные имена запроса:

| `name` | Ответ |
| --- | --- |
| `all`, `state`, `car`, `carState`, `car_state` | общий снимок: `vehicle`, `heat`, `seats` |
| `vehicle`, `vehicleState`, `vehicle_state` | скорость, обороты, двигатель, температура, АКБ, топливо, водитель, люк, паркинг |
| `heat`, `heats`, `heating`, `climate` | состояния обогревов руля, лобового и заднего стекла, температура водителя и пассажира |
| `seats` | передние и задние сиденья |
| `frontSeats`, `front_seats` | передние сиденья |
| `rearSeats`, `rear_seats`, `zadSeats`, `zad_seats` | задние сиденья |
| `fuel`, `fuelPercent`, `fuel_percent`, `getFuelPercent` | уровень топлива в процентах |
| `speed`, `getSpeed` | скорость |
| `rpm`, `getRPM` | обороты двигателя |
| `engine`, `engineState`, `getstatengin` | состояние двигателя |
| `outTemp`, `out_temp`, `getouttemp` | наружная температура |
| `driverTemp`, `driver_temp` | температура водителя |
| `passengerTemp`, `passenger_temp` | температура пассажира |
| `cabinTemp`, `cabin_temp` | температура водителя и пассажира |
| `vod`, `getvod` | выбранный водитель / профиль |
| `sun`, `getsun` | состояние люка |
| `park`, `parkOnOff`, `getParkOnOff` | состояние парковочного режима |
| `battery`, `batteryVoltage`, `akbvolt` | напряжение АКБ |
| `rulHeat`, `steeringHeat`, `getrulheat` | обогрев руля |
| `lobHeat`, `windshieldHeat`, `getlobheat` | обогрев лобового стекла |
| `zadHeat`, `rearHeat`, `getzadheat` | обогрев заднего стекла |

```js
const car = JSON.parse(
  window.androidApi.getCarData(TOKEN, "all")
);
```

Пример ответа для `all`:

```json
{
  "name": "all",
  "vehicle": {
    "name": "vehicle",
    "speed": 42,
    "rpm": 1200,
    "engine": true,
    "outTemp": 18,
    "batteryVoltage": 12.4,
    "fuelPercent": 75.3,
    "fuelPercentRaw": 753,
    "vod": 1,
    "sun": false,
    "park": false
  },
  "heat": {
    "name": "heat",
    "rulHeat": true,
    "lobHeat": false,
    "zadHeat": false,
    "driverTemp": 22.0,
    "passengerTemp": 22.5
  },
  "seats": {
    "name": "seats",
    "front": {
      "name": "frontSeats",
      "frontLeft": {
        "seat": 1,
        "heat": 2,
        "vent": 0
      },
      "frontRight": {
        "seat": 2,
        "heat": 0,
        "vent": 1
      }
    },
    "rear": {
      "name": "rearSeats",
      "rearLeft": {
        "seat": 0,
        "heat": 1
      },
      "rearRight": {
        "seat": 1,
        "heat": 0
      }
    }
  }
}
```

Старый формат `frontSeats` сохранён:

```js
const seats = JSON.parse(
  window.androidApi.getCarData(TOKEN, "frontSeats")
);
```

```json
{
  "name": "frontSeats",
  "frontLeft": {
    "seat": 1,
    "heat": 2,
    "vent": 0
  },
  "frontRight": {
    "seat": 2,
    "heat": 0,
    "vent": 1
  }
}
```

Где:

| Поле | Значение |
| --- | --- |
| `seat: 0` | левое заднее сиденье |
| `seat: 1` | левое / водительское переднее сиденье или правое заднее сиденье, зависит от блока ответа |
| `seat: 2` | правое / пассажирское переднее сиденье |
| `heat` | текущий уровень подогрева |
| `vent` | текущий уровень вентиляции |

Температуру водителя и пассажира можно получить одним запросом:

```js
const cabinTemp = JSON.parse(
  window.androidApi.getCarData(TOKEN, "cabinTemp")
);
```

```json
{
  "name": "cabinTemp",
  "driverTemp": 22.0,
  "passengerTemp": 22.5
}
```

Для одиночных значений возвращается объект с полями `name` и `value`:

```js
const speed = JSON.parse(
  window.androidApi.getCarData(TOKEN, "speed")
);
```

```json
{
  "name": "speed",
  "value": 42
}
```

Уровень топлива можно получить отдельным запросом:

```js
const fuel = JSON.parse(
  window.androidApi.getCarData(TOKEN, "fuel")
);
```

```json
{
  "command": "get_fuel_percent",
  "success": true,
  "raw": 753,
  "value": 75.3,
  "percent": 75.3,
  "unit": "%",
  "rawValues": [753],
  "name": "fuelPercent"
}
```

`raw` хранит исходное 16-bit значение `0..1000`, где `1000` означает `100.0%`. Поля `value` и `percent` уже переведены в проценты.

### `carCommand(token, json)` / `carCmd(token, json)`

Передаёт JSON-команду напрямую в текущий автомобильный proxy через `CarCmdProxy.c(JSONObject)` и возвращает JSON-ответ строкой. Метод нужен для расширяемых команд, которые не входят в стандартные getter’ы `CarCmdProxy`.

```js
const fuel = JSON.parse(
  window.androidApi.carCommand(TOKEN, JSON.stringify({
    cmd: "get_fuel_percent"
  }))
);
```

Пример ответа:

```json
{
  "command": "get_fuel_percent",
  "success": true,
  "raw": 753,
  "value": 75.3,
  "percent": 75.3,
  "unit": "%",
  "rawValues": [753]
}
```

Для Jaecoo PHEV также доступны команды режимов:

```js
window.androidApi.carCommand(TOKEN, JSON.stringify({
  cmd: "set_energy_recycle",
  value: 3
}));

window.androidApi.carCommand(TOKEN, JSON.stringify({
  cmd: "set_battery_protection",
  value: 2
}));
```

Значения:

| Команда | Значения |
| --- | --- |
| `set_energy_recycle` | `1` low, `2` medium, `3` high |
| `set_battery_protection` | `1` Initial, `2` Smart, `4` Forced |
| `get_energy_recycle` | возвращает текущий уровень рекуперации |
| `get_battery_protection` | возвращает текущий режим защиты батареи |

Если конкретный автомобильный proxy не переопределяет getter из `CarCmdProxy`, вернётся default-значение интерфейса: обычно `false`, `0` или `0f`; для наружной температуры используется `-99`, для температуры салона - `-99f`.

### `getUserApps(token)`

Возвращает JSON-массив пользовательских приложений.

```js
const apps = JSON.parse(window.androidApi.getUserApps(TOKEN));
```

Пример ответа:

```json
[
  {
    "name": "Навигатор",
    "package": "ru.yandex.yandexnavi",
    "icon": "iVBORw0KGgo..."
  },
  {
    "name": "Музыка",
    "package": "com.example.music",
    "icon": "iVBORw0KGgo..."
  }
]
```

### `getAppInfo(token, packageName)`

Возвращает JSON-строку с названием и иконкой приложения.

```js
const appInfo = JSON.parse(
  window.androidApi.getAppInfo(TOKEN, "ru.yandex.yandexnavi")
);
```

Пример ответа:

```json
{
  "name": "Навигатор",
  "icon": "iVBORw0KGgo..."
}
```

### `getRunEnum(token)`

Возвращает JSON-массив доступных команд.

```js
const commands = JSON.parse(window.androidApi.getRunEnum(TOKEN));
```

Пример ответа:

```json
[
  {
    "RunEnum": "MEDIA_PLAY",
    "RunEnumText": "Медиа плей"
  },
  {
    "RunEnum": "MEDIA_PAUSE",
    "RunEnumText": "Медиа пауза"
  }
]
```

### `getRunEnumPic(token, enumName)`

Возвращает base64-строку иконки команды.

```js
const iconBase64 = window.androidApi.getRunEnumPic(TOKEN, "MEDIA_PLAY");
image.src = "data:image/png;base64," + iconBase64;
```

Пример ответа:

```text
iVBORw0KGgoAAAANSUhEUg...
```

### `getFileList(token)`

Возвращает JSON-массив файлов из Downloads.

```js
const files = JSON.parse(window.androidApi.getFileList(TOKEN));
```

Пример ответа:

```json
[
  {
    "name": "theme.zip",
    "size": 88340,
    "date": 1770000000000
  }
]
```

### `getFile(token, name)`

Возвращает base64-содержимое файла. Если файл не найден или токен неверный, возвращается пустая строка.

```js
const fileBase64 = window.androidApi.getFile(TOKEN, "theme.zip");
```

Пример ответа:

```text
UEsDBBQAAAAIA...
```

### Ошибки

Методы, которые возвращают JSON-строку, обычно возвращают объект с полем `error`.

```json
{
  "error": "unauthorized"
}
```

Возможные ошибки для `getCarData`:

| Ошибка | Значение |
| --- | --- |
| `unauthorized` | неверный токен |
| `empty_name` | не передано имя запроса |
| `unknown_data` | неизвестное имя запроса |
| `car_cmd_proxy_null` | данные автомобиля недоступны |

## Android -> JS

Android отправляет события в функцию:

```js
window.onAndroidEvent = function(type, data) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }
};
```

| Событие | Поля `data` | Назначение |
| --- | --- | --- |
| `musicInfo` | `PlayStat`, `SongName`, `SongArtist`, `SongAlbum`, `SongAlbumPicture`, `Trpos`, `Trdur` | Данные текущего трека. |
| `gps` | `lat`, `lon`, `speed`, `heading` | Координаты, GPS-скорость и курс. |
| `speed` | `value` | Скорость автомобиля. |
| `weather` | `temp`, `icon` | Погода. |
| `theme` | `mode` | Тема: `dark` или `light`. |
| `LogData` | `value` | Строка из автомобильного лога, найденная по фильтрам `setLogFilter(...)`. |
| `ping` | `ok` | Ответ на `pingEvent(token)`. |

### Получение данных из логов авто

Сначала задаются фильтры:

```js
window.androidApi.setLogFilter(
  TOKEN,
  "VehicleSpeed",
  "SeatHeat",
  "HVAC"
);
```

Затем подходящие строки приходят событием `LogData`:

```js
window.onAndroidEvent = function(type, data) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }

  if (type === "LogData") {
    console.log(data.value);
  }
};
```

Пример события:

```json
{
  "value": "[HVAC] SeatHeat left level=2"
}
```

## Команды `runEnum`

Команда запускается по имени:

```js
window.androidApi.runEnum(TOKEN, "MEDIA_PLAY");
```

| Группа | Имена | Описание |
| --- | --- | --- |
| Навигация интерфейса | `GO_TO_PP`, `GO_TO_GU`, `TOGGLE_GU_PP`, `TOGGLE_GU_PP_CPP`, `GO_CPP_TO_PP`, `TOGGLE_CPP_PP` | Переключение между головным устройством, приборкой, картами и штатными экранами. |
| Системные действия | `RUN_BLACK`, `OPEN_SHTORKA`, `CLOSE_SHTORKA`, `GLOBAL_BACK`, `GLOBAL_HOME`, `RUN_START_APP_MENU`, `RUN_FUN_CAR`, `SPLIT_RUN` | Чёрный экран, шторка, глобальные кнопки, меню приложений, быстрый доступ к функциям авто и разделение экрана. |
| Медиа | `MEDIA_PLAY`, `MEDIA_PAUSE`, `MEDIA_NEXT`, `MEDIA_BLACK`, `Volume_Down`, `Volume_Up` | Плей, пауза, следующий и предыдущий трек, уменьшение и увеличение громкости на 1 процент от текущей. |
| Передние сиденья | `heat_seat_l_0..3`, `heat_seat_r_0..3`, `vent_seat_l_0..3`, `vent_seat_r_0..3` | Подогрев и вентиляция водительского и пассажирского передних сидений. |
| Обогревы | `heat_wheel_on`, `heat_wheel_off`, `heat_windshield_on`, `heat_windshield_off`, `heat_rearwindow_on`, `heat_rearwindow_off` | Руль, лобовое стекло и заднее стекло. |
| Климат | `Driver_Temp_Down`, `Driver_Temp_Up`, `Passenger_Temp_Down`, `Passenger_Temp_Up` | Уменьшение и увеличение температуры водителя или пассажира на 1 от текущей. |
| Задние сиденья | `heat_zad_seat_l_0..3`, `heat_zad_seat_r_off`, `heat_zad_seat_r_1..3` | Подогрев заднего левого и заднего правого сиденья. |
| Профили и прочее | `VIBOR_VODITEL`, `voditel_seat_1`, `voditel_seat_2`, `voditel_seat_3`, `VIEW_ALL_MESSAGE`, `b_fiksik_on`, `b_fiksik_off`, `RUN_APP_MORE`, `RUN_SPICH_FOCUS`, `Recirculation_On`, `Recirculation_Off` | Выбор водителя, сообщения, голосовой помощник, группа задач и рециркуляция. |

## Примеры

### Запуск приложения из сохранённого слота

```js
const app = JSON.parse(localStorage.getItem("app_slot_1"));

if (app) {
  window.androidApi.runApp(TOKEN, app.package);
}
```

### Обновление плеера по событию

```js
window.onAndroidEvent = function(type, data) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }

  if (type === "musicInfo") {
    document.querySelector(".title").textContent = data.SongName || "";
    document.querySelector(".artist").textContent = data.SongArtist || "";
  }
};
```

## Приборная панель / HUD

HUD-экран принимает навигационные, антирадарные и GPS-события от Android. Для запуска обмена данными экран вызывает:

```js
window.androidApi.onJsReady(TOKEN);
```

### События HUD

| Событие | Поля `data` | Назначение |
| --- | --- | --- |
| `hud` | `hudSenderType`, `aradarOn`, `naviOn`, `turnType`, `turnDist`, `remainDist`, `nextRoad`, `speedLimit` | Навигация и антирадар. `hudSenderType` определяет тип панели: `NAVI` или `ARAD`. |
| `GPSSignalQuality` | `updateSignalQuality` | Качество GPS-сигнала для индикатора на HUD. |

### Пример события NAVI

```json
{
  "hudSenderType": "NAVI",
  "aradarOn": false,
  "naviOn": true,
  "turnType": 3,
  "turnDist": 420,
  "remainDist": 8500,
  "nextRoad": "Ленина",
  "speedLimit": 60
}
```

### Пример события ARAD

```json
{
  "hudSenderType": "ARAD",
  "aradarOn": true,
  "naviOn": false,
  "turnType": 14,
  "turnDist": 70,
  "remainDist": 70,
  "nextRoad": "",
  "speedLimit": 90
}
```

### Пример качества GPS

```json
{
  "updateSignalQuality": 65
}
```

### Приём событий HUD

```js
window.onAndroidEvent = function(type, data) {
  if (type === "GPSSignalQuality") {
    updateGpsLevel(data.updateSignalQuality);
    return;
  }

  if (type === "hud") {
    updateHud(data);
  }
};
```

### Коды манёвров HUD

| Код | Манёвр |
| --- | --- |
| `2` | Поворот налево |
| `3` | Поворот направо |
| `4` | Съезд / развилка налево |
| `5` | Съезд / развилка направо |
| `6` | Резкий поворот налево |
| `7` | Резкий поворот направо |
| `8` | Разворот налево |
| `19` | Разворот направо |
| `9` | Движение прямо |
| `24` | Въезд на круговое движение |
| `55` | Выезд с кругового движения |
| `15` | Финиш маршрута |
| `49` | Паром / переправа |
| `14` | Камера / контроль |

### Уровни GPS

| Значение `updateSignalQuality` | Состояние |
| --- | --- |
| `null` / `undefined` | Индикатор скрыт |
| `< 14` | Низкий сигнал |
| `14..29` | Уровень 1 |
| `30..49` | Уровень 2 |
| `50..69` | Уровень 3 |
| `70..79` | Уровень 4 |
| `>= 80` | Уровень 5 |
