// Heating Water Page - 5 Heater Train View
import { useState } from 'react';
import { useTagValue, useSimulatorStore } from '../store/simulatorStore';
import { ValueDisplay, Bargraph } from '../components/common/ValueDisplay';

export function HeatingWaterPage() {
  const [selectedTrain, setSelectedTrain] = useState<number | null>(null);

  const supplyTemp = useTagValue('TT-100');
  const inletTemp = useTagValue('TT-101');
  const totalFlow = useTagValue('FT-100');
  const heatersRunning = useTagValue('HW.HEATERS-RUNNING');
  const heatersAvail = useTagValue('HW.HEATERS-AVAIL');
  const pumpsRunning = useTagValue('HW.PUMPS-RUNNING');
  const totalGas = useTagValue('HW.TOTAL-GAS');
  const hwMode = useTagValue('HW.MODE');

  const setTag = useSimulatorStore(state => state.setTag);

  const toggleMode = () => {
    setTag('HW.MODE', hwMode === 1 ? 0 : 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Header */}
      <div className="panel">
        <div className="panel-header">
          <span>HEATING WATER SYSTEM</span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>
              Heaters: <strong style={{ color: '#00ff00' }}>{heatersRunning}/{heatersAvail}</strong>
            </span>
            <span>
              Pumps: <strong style={{ color: '#00ff00' }}>{pumpsRunning}/5</strong>
            </span>
            <button
              className={`btn ${hwMode === 1 ? 'btn-success' : 'btn-warning'}`}
              onClick={toggleMode}
              style={{ padding: '4px 12px' }}
            >
              {hwMode === 1 ? 'AUTO' : 'MANUAL'}
            </button>
          </div>
        </div>
        <div className="panel-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <ValueDisplay
              tagId="TT-101"
              label="Inlet Temperature"
              unit="°C"
              decimals={1}
              alarmLimits={{ ll: 2, l: 3 }}
            />
            <ValueDisplay
              tagId="TT-100"
              label="Supply Temperature"
              unit="°C"
              decimals={1}
              alarmLimits={{ ll: 10, l: 15, h: 25, hh: 30 }}
            />
            <ValueDisplay
              tagId="FT-100"
              label="Total Flow"
              unit="m³/h"
              decimals={0}
              alarmLimits={{ ll: 100, l: 200 }}
            />
            <div>
              <Bargraph
                tagId="HW.TOTAL-GAS"
                label="Daily Gas Usage"
                min={0}
                max={120}
                unit="Nm³"
                alarmLimits={{ h: 100 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Heater Trains */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', flex: 1 }}>
        {[1, 2, 3, 4, 5].map(trainId => (
          <HeaterTrainCard
            key={trainId}
            trainId={trainId}
            onClick={() => setSelectedTrain(trainId)}
          />
        ))}
      </div>

      {/* Train Detail Faceplate */}
      {selectedTrain && (
        <HeaterTrainFaceplate
          trainId={selectedTrain}
          onClose={() => setSelectedTrain(null)}
        />
      )}
    </div>
  );
}

// Heater Train Card Component
function HeaterTrainCard({ trainId, onClick }: { trainId: number; onClick: () => void }) {
  const prefix = trainId * 10 + 100;

  const pumpRunning = useTagValue(`PMP-${prefix}.RUN`);
  const pumpTripped = useTagValue(`PMP-${prefix}.TRIP`);
  const heaterRunning = useTagValue(`HTR-${prefix}.RUN`);
  const heaterTripped = useTagValue(`HTR-${prefix}.TRIP`);
  const heaterAvail = useTagValue(`HTR-${prefix}.AVAIL`);
  const outletTemp = useTagValue(`TT-${prefix}`);
  const waterFlow = useTagValue(`FT-${prefix}`);
  const gasToday = useTagValue(`FT-${prefix + 1}.TOT`);
  const pumpPower = useTagValue(`PMP-${prefix}.KW`);

  const getPumpStatus = () => {
    if (pumpTripped) return { text: 'TRIPPED', color: '#ff0000' };
    if (pumpRunning) return { text: 'RUNNING', color: '#00ff00' };
    return { text: 'STOPPED', color: '#888888' };
  };

  const getHeaterStatus = () => {
    if (heaterTripped) return { text: 'TRIPPED', color: '#ff0000' };
    if (!heaterAvail) return { text: 'LIMITED', color: '#ff8800' };
    if (heaterRunning) return { text: 'RUNNING', color: '#00ff00' };
    return { text: 'OFF', color: '#888888' };
  };

  const pumpStatus = getPumpStatus();
  const heaterStatus = getHeaterStatus();

  return (
    <div
      className="panel"
      onClick={onClick}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      <div className="panel-header">
        <span>TRAIN {trainId}</span>
      </div>
      <div className="panel-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Pump Status */}
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>PUMP</div>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: `3px solid ${pumpStatus.color}`,
            margin: '0 auto 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px' }}>P</span>
          </div>
          <div style={{ color: pumpStatus.color, fontSize: '12px', fontWeight: 'bold' }}>
            {pumpStatus.text}
          </div>
          {pumpRunning > 0 && (
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              {pumpPower.toFixed(0)} kW
            </div>
          )}
        </div>

        {/* Heater Status */}
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>HEATER</div>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${heaterStatus.color}`,
            margin: '0 auto 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px' }}>H</span>
          </div>
          <div style={{ color: heaterStatus.color, fontSize: '12px', fontWeight: 'bold' }}>
            {heaterStatus.text}
          </div>
        </div>

        {/* Measurements */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Outlet Temp</div>
          <div style={{
            fontSize: '20px',
            fontFamily: 'Consolas',
            color: heaterRunning ? '#00ff00' : '#888'
          }}>
            {outletTemp.toFixed(1)}°C
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888' }}>Flow</div>
          <div style={{ fontSize: '16px', fontFamily: 'Consolas' }}>
            {waterFlow.toFixed(0)} m³/h
          </div>
        </div>

        {/* Gas Usage */}
        <div>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Gas Today</div>
          <div className="bargraph-container" style={{ height: '16px' }}>
            <div
              className="bargraph-fill"
              style={{
                width: `${(gasToday / 24) * 100}%`,
                backgroundColor: gasToday > 22 ? '#ff8800' : '#00ff00'
              }}
            />
            <div className="bargraph-value">{gasToday.toFixed(1)}/24</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Heater Train Faceplate
function HeaterTrainFaceplate({ trainId, onClose }: { trainId: number; onClose: () => void }) {
  const prefix = trainId * 10 + 100;

  const pumpRunning = useTagValue(`PMP-${prefix}.RUN`);
  const pumpTripped = useTagValue(`PMP-${prefix}.TRIP`);
  const pumpAmps = useTagValue(`PMP-${prefix}.AMPS`);
  const pumpPower = useTagValue(`PMP-${prefix}.KW`);
  const heaterRunning = useTagValue(`HTR-${prefix}.RUN`);
  const heaterTripped = useTagValue(`HTR-${prefix}.TRIP`);
  const heaterAvail = useTagValue(`HTR-${prefix}.AVAIL`);
  const inletTemp = useTagValue(`TT-${prefix + 1}`);
  const outletTemp = useTagValue(`TT-${prefix}`);
  const waterFlow = useTagValue(`FT-${prefix}`);
  const gasRate = useTagValue(`FT-${prefix + 1}`);
  const gasToday = useTagValue(`FT-${prefix + 1}.TOT`);

  const startPump = useSimulatorStore(state => state.startPump);
  const stopPump = useSimulatorStore(state => state.stopPump);
  const enableHeater = useSimulatorStore(state => state.enableHeater);
  const disableHeater = useSimulatorStore(state => state.disableHeater);

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="faceplate" style={{ minWidth: '400px' }}>
        <div className="faceplate-header">
          <h3>HEATER TRAIN {trainId} DETAIL</h3>
          <button className="faceplate-close" onClick={onClose}>×</button>
        </div>

        <div className="faceplate-content">
          {/* Pump Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
              PUMP {trainId}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Status</div>
                <div style={{
                  color: pumpTripped ? '#ff0000' : pumpRunning ? '#00ff00' : '#888',
                  fontWeight: 'bold'
                }}>
                  {pumpTripped ? 'TRIPPED' : pumpRunning ? 'RUNNING' : 'STOPPED'}
                </div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Current</div>
                <div>{pumpAmps.toFixed(0)} A</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Power</div>
                <div>{pumpPower.toFixed(0)} kW</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Flow</div>
                <div>{waterFlow.toFixed(0)} m³/h</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                className="btn btn-success"
                onClick={() => startPump(trainId)}
                disabled={pumpRunning > 0 || pumpTripped > 0}
                style={{ flex: 1 }}
              >
                START
              </button>
              <button
                className="btn btn-danger"
                onClick={() => stopPump(trainId)}
                disabled={pumpRunning === 0}
                style={{ flex: 1 }}
              >
                STOP
              </button>
            </div>
          </div>

          {/* Heater Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
              HEATER {trainId}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Status</div>
                <div style={{
                  color: heaterTripped ? '#ff0000' : !heaterAvail ? '#ff8800' : heaterRunning ? '#00ff00' : '#888',
                  fontWeight: 'bold'
                }}>
                  {heaterTripped ? 'TRIPPED' : !heaterAvail ? 'LIMITED' : heaterRunning ? 'RUNNING' : 'OFF'}
                </div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Gas Rate</div>
                <div>{gasRate.toFixed(2)} Nm³/h</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Gas Today</div>
                <div style={{ color: gasToday > 22 ? '#ff8800' : 'inherit' }}>
                  {gasToday.toFixed(1)} / 24 Nm³
                </div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Available</div>
                <div style={{ color: heaterAvail ? '#00ff00' : '#ff0000' }}>
                  {heaterAvail ? 'YES' : 'NO'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                className="btn btn-success"
                onClick={() => enableHeater(trainId)}
                disabled={heaterRunning > 0 || heaterTripped > 0 || !heaterAvail || pumpRunning === 0}
                style={{ flex: 1 }}
              >
                ENABLE
              </button>
              <button
                className="btn btn-danger"
                onClick={() => disableHeater(trainId)}
                disabled={heaterRunning === 0}
                style={{ flex: 1 }}
              >
                DISABLE
              </button>
            </div>
          </div>

          {/* Temperatures */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
              TEMPERATURES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Inlet</div>
                <div style={{ fontSize: '24px', fontFamily: 'Consolas' }}>{inletTemp.toFixed(1)}°C</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Outlet</div>
                <div style={{ fontSize: '24px', fontFamily: 'Consolas', color: '#00ff00' }}>
                  {outletTemp.toFixed(1)}°C
                </div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>Rise</div>
                <div style={{ fontSize: '24px', fontFamily: 'Consolas' }}>
                  {(outletTemp - inletTemp).toFixed(1)}°C
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
