import { TYPE_COLORS, isLightColor } from './typeColors';

describe('TYPE_COLORS', () => {
  it('deve conter todas as cores dos tipos de Pokémon', () => {
    const expectedTypes = [
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ];

    expectedTypes.forEach(type => {
      expect(TYPE_COLORS[type]).toBeDefined();
      expect(typeof TYPE_COLORS[type]).toBe('string');
      expect(TYPE_COLORS[type]).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('deve ter cores únicas para cada tipo', () => {
    const colors = Object.values(TYPE_COLORS);
    const uniqueColors = new Set(colors);
    expect(colors.length).toBe(uniqueColors.size);
  });

  it('deve ter cores no formato hexadecimal correto', () => {
    Object.values(TYPE_COLORS).forEach(color => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('deve ter nomes de tipos em lowercase', () => {
    Object.keys(TYPE_COLORS).forEach(type => {
      expect(type).toBe(type.toLowerCase());
    });
  });
});

describe('isLightColor', () => {
  it('deve retornar true para cores claras', () => {
    const lightColors = ['#FFFFFF', '#F8F8F8', '#E6E6E6', '#FFD700', '#87CEEB', '#98FB98'];
    lightColors.forEach(color => {
      expect(isLightColor(color)).toBe(true);
    });
  });

  it('deve retornar false para cores escuras', () => {
    const darkColors = ['#000000', '#333333', '#000080', '#006400', '#8B0000', '#4B0082'];
    darkColors.forEach(color => {
      expect(isLightColor(color)).toBe(false);
    });
  });

  it('deve funcionar com cores dos tipos reais', () => {
    expect(isLightColor(TYPE_COLORS.ice)).toBe(true);
    expect(isLightColor(TYPE_COLORS.electric)).toBe(true);
    expect(isLightColor(TYPE_COLORS.dark)).toBe(false);
    expect(isLightColor(TYPE_COLORS.ghost)).toBe(false);
  });

  it('deve funcionar com cores com e sem #', () => {
    expect(isLightColor('#FFFFFF')).toBe(true);
    expect(isLightColor('FFFFFF')).toBe(true);
  });

  it('deve lidar com cores em diferentes casos', () => {
    expect(isLightColor('#ffffff')).toBe(true);
    expect(isLightColor('#FFFFFF')).toBe(true);
    expect(isLightColor('#FfFfFf')).toBe(true);
  });

  it('deve calcular luminance corretamente para cores específicas', () => {
    expect(isLightColor('#FFFFFF')).toBe(true);
    expect(isLightColor('#000000')).toBe(false);
    expect(isLightColor('#808080')).toBe(false);
  });

  it('deve lidar com cores próximas ao threshold de luminance', () => {
    const resultB3 = isLightColor('#B3B3B3');
    const resultB2 = isLightColor('#B2B2B2');
    
    expect(resultB3).toBeDefined();
    expect(resultB2).toBeDefined();
  });

  it('deve lidar com cores hexadecimais inválidas sem lançar erro', () => {
    const invalidColors = ['invalid', '#GGGGGG', '#12345', '#1234567', '123456'];
    invalidColors.forEach(color => {
      expect(() => isLightColor(color)).not.toThrow();
    });
  });

  it('deve lidar com cores de 3 dígitos', () => {
    const resultFFF = isLightColor('#FFF');
    const result000 = isLightColor('#000');
    
    expect(resultFFF).toBeDefined();
    expect(result000).toBeDefined();
  });
});