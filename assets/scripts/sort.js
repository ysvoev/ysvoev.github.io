(function () {
    var COLS_PER_ROW = 3;
  
    function shuffleInPlace(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }
  
    function extractPinPosition(filter) {
      if (!filter) return null;
      var match = filter.match(/pin(\d+)/);
      if (match) return parseInt(match[1], 10);
      if (filter.indexOf('pin') !== -1) return -1;
      return null;
    }
  
    function extractRowNumber(filter) {
      if (!filter) return null;
      var match = filter.match(/row(\d+)/);
      if (match) return parseInt(match[1], 10);
      return null;
    }
  
    function extractGroupKey(filter) {
      if (!filter) return null;
      var tokens = filter.split(/\s+/);
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (token.indexOf('&') === 0) continue;
        if (token === 'pin' || token.indexOf('pin') === 0) continue;
        if (token === 'row' || token.indexOf('row') === 0) continue;
        var match = token.match(/^([a-zA-Z]+)(\d+)$/);
        if (match) {
          return { key: match[1], number: parseInt(match[2], 10) };
        } else {
          return { key: token, number: null };
        }
      }
      return null;
    }
  
    function buildBlocks(pages) {
      var groups = {};
      var singles = [];
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var filter = page.getAttribute('data-filter');
        var groupInfo = extractGroupKey(filter);
        if (groupInfo) {
          var key = groupInfo.key;
          if (!groups[key]) groups[key] = { pages: [], hasNumber: false };
          groups[key].pages.push(page);
          if (groupInfo.number !== null) {
            groups[key].hasNumber = true;
            page._groupNumber = groupInfo.number;
          }
        } else {
          singles.push(page);
        }
      }
      var blocks = [];
      for (var key in groups) {
        if (groups.hasOwnProperty(key)) {
          var group = groups[key];
          var groupPages = group.pages;
          if (group.hasNumber) {
            groupPages.sort(function (a, b) {
              return (a._groupNumber || 0) - (b._groupNumber || 0);
            });
            for (var g = 0; g < groupPages.length; g++) delete groupPages[g]._groupNumber;
            blocks.push(groupPages.slice());
          } else {
            shuffleInPlace(groupPages);
            blocks.push(groupPages.slice());
          }
        }
      }
      for (var j = 0; j < singles.length; j++) blocks.push(singles[j]);
      return blocks;
    }
  
    function pinCards() {
      var portfolio = document.querySelector('.portfolio');
      if (!portfolio) return;
  
      var pages = Array.from(portfolio.querySelectorAll('.page'));
      if (pages.length <= 1) return;
  
      var pinnedWithPosition = [];
      var pinnedWithoutPosition = [];
      var rowPages = [];
      var normalPages = [];
  
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var filter = page.getAttribute('data-filter');
        var pinPos = extractPinPosition(filter);
        if (pinPos !== null) {
          if (pinPos === -1) pinnedWithoutPosition.push(page);
          else pinnedWithPosition.push({ page: page, position: pinPos });
        } else {
          var rowNum = extractRowNumber(filter);
          if (rowNum !== null) rowPages.push({ page: page, rowNumber: rowNum });
          else normalPages.push(page);
        }
      }
  
      // Нет закреплений – просто перемешиваем блоки (группы) целиком
      if (pinnedWithPosition.length === 0 && pinnedWithoutPosition.length === 0 && rowPages.length === 0) {
        var blocks = buildBlocks(normalPages);
        shuffleInPlace(blocks);
        var fragment = document.createDocumentFragment();
        for (var b = 0; b < blocks.length; b++) {
          var block = blocks[b];
          if (Array.isArray(block)) {
            for (var bi = 0; bi < block.length; bi++) {
              fragment.appendChild(block[bi]);
            }
          } else {
            fragment.appendChild(block);
          }
        }
        portfolio.appendChild(fragment);
        return;
      }
  
      shuffleInPlace(pinnedWithoutPosition);
      shuffleInPlace(rowPages);
      pinnedWithPosition.sort(function (a, b) { return a.position - b.position; });
  
      var rowsMap = {};
      for (var r = 0; r < rowPages.length; r++) {
        var rowItem = rowPages[r];
        if (!rowsMap[rowItem.rowNumber]) rowsMap[rowItem.rowNumber] = [];
        rowsMap[rowItem.rowNumber].push(rowItem.page);
      }
      for (var rowKey in rowsMap) shuffleInPlace(rowsMap[rowKey]);
  
      var totalPages = pages.length;
      var finalOrder = new Array(totalPages);
      var usedPositions = {};
  
      // 1. pin с номерами
      for (var j = 0; j < pinnedWithPosition.length; j++) {
        var item = pinnedWithPosition[j];
        var pos = item.position;
        if (pos <= totalPages && !usedPositions[pos]) {
          finalOrder[pos - 1] = item.page;
          usedPositions[pos] = true;
        }
      }
  
      // 2. row
      var rowNumbers = Object.keys(rowsMap).map(Number).sort(function (a, b) { return a - b; });
      for (var rn = 0; rn < rowNumbers.length; rn++) {
        var rowNum = rowNumbers[rn];
        var rowItems = rowsMap[rowNum];
        var startPos = (rowNum - 1) * COLS_PER_ROW + 1;
        var endPos = rowNum * COLS_PER_ROW;
        var freePositions = [];
        for (var pos2 = startPos; pos2 <= endPos; pos2++) {
          if (pos2 <= totalPages && !usedPositions[pos2] && finalOrder[pos2 - 1] === undefined) {
            freePositions.push(pos2);
          }
        }
        shuffleInPlace(freePositions);
        var toPlace = rowItems.slice();
        for (var ri = 0; ri < toPlace.length && ri < freePositions.length; ri++) {
          var pos3 = freePositions[ri];
          finalOrder[pos3 - 1] = toPlace[ri];
          usedPositions[pos3] = true;
        }
        if (toPlace.length > freePositions.length) {
          for (var rest = freePositions.length; rest < toPlace.length; rest++) {
            normalPages.push(toPlace[rest]);
          }
        }
      }
  
      // 3. pin без номера
      var pinIdx = 0;
      for (var m = 0; m < totalPages; m++) {
        if (finalOrder[m] === undefined && pinIdx < pinnedWithoutPosition.length) {
          finalOrder[m] = pinnedWithoutPosition[pinIdx];
          pinIdx++;
        }
      }
      for (var n = 0; n < totalPages; n++) {
        if (finalOrder[n] === undefined && pinIdx < pinnedWithoutPosition.length) {
          finalOrder[n] = pinnedWithoutPosition[pinIdx];
          pinIdx++;
        }
      }
  
      // 4. Остальные страницы – собираем блоки, перемешиваем
      var allBlocks = buildBlocks(normalPages);
      shuffleInPlace(allBlocks);
  
      // Получаем список свободных индексов
      var freeSlots = [];
      for (var i = 0; i < totalPages; i++) {
        if (finalOrder[i] === undefined) freeSlots.push(i);
      }
  
      var unplacedBlocks = [];
  
      // Размещаем каждый блок
      for (var b = 0; b < allBlocks.length; b++) {
        var block = allBlocks[b];
        var need = Array.isArray(block) ? block.length : 1;
        var placed = false;
  
        if (Array.isArray(block)) {
          // Ищем все возможные непрерывные последовательности
          var possibleStarts = [];
          for (var s = 0; s <= freeSlots.length - need; s++) {
            var ok = true;
            for (var k = 0; k < need; k++) {
              if (freeSlots[s + k] !== freeSlots[s] + k) {
                ok = false;
                break;
              }
            }
            if (ok) possibleStarts.push(s);
          }
          if (possibleStarts.length > 0) {
            var chosen = possibleStarts[Math.floor(Math.random() * possibleStarts.length)];
            var startPos = freeSlots[chosen];
            for (var k2 = 0; k2 < need; k2++) {
              finalOrder[startPos + k2] = block[k2];
            }
            var removed = 0;
            for (var r2 = chosen; r2 < chosen + need; r2++) {
              freeSlots.splice(r2 - removed, 1);
              removed++;
            }
            placed = true;
          }
        } else {
          if (freeSlots.length > 0) {
            var randIdx = Math.floor(Math.random() * freeSlots.length);
            var slot = freeSlots[randIdx];
            finalOrder[slot] = block;
            freeSlots.splice(randIdx, 1);
            placed = true;
          }
        }
  
        if (!placed) {
          unplacedBlocks.push(block);
        }
      }
  
      // Собираем финальный порядок
      var cleanOrder = [];
      for (var i = 0; i < totalPages; i++) {
        if (finalOrder[i] !== undefined) cleanOrder.push(finalOrder[i]);
      }
      for (var u = 0; u < unplacedBlocks.length; u++) {
        var blk = unplacedBlocks[u];
        if (Array.isArray(blk)) {
          for (var bi = 0; bi < blk.length; bi++) cleanOrder.push(blk[bi]);
        } else {
          cleanOrder.push(blk);
        }
      }
  
      var fragment = document.createDocumentFragment();
      for (var s = 0; s < cleanOrder.length; s++) {
        fragment.appendChild(cleanOrder[s]);
      }
      portfolio.appendChild(fragment);
    }
  
    document.addEventListener('DOMContentLoaded', function () {
      pinCards();
      if (typeof window.applyVisuals === 'function') {
        window.applyVisuals();
      }
    });
  })();